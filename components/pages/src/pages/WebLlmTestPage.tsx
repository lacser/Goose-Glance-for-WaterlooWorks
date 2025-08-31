import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Field,
  Input,
  Label,
  ProgressBar,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Textarea,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { ChatCompletionRequest, ResponseFormat } from "@mlc-ai/web-llm";
import {
  ChatCompletionMessageParam,
  ChatCompletionChunk,
  CreateExtensionServiceWorkerMLCEngine,
  InitProgressReport,
  MLCEngineInterface,
} from "@mlc-ai/web-llm";

type Nullable<T> = T | null;

const MODELS = [
  { id: "Phi-3.5-mini-instruct-q4f16_1-MLC", label: "Phi-3.5-mini" },
  { id: "Qwen3-4B-q4f16_1-MLC", label: "Qwen3-4B" },
];

function WebLlmTestPage() {
  const styles = useStyles();
  // Engine & model state
  const engineRef = useRef<Nullable<MLCEngineInterface>>(null);
  const [selectedModel, setSelectedModel] = useState<string>(MODELS[0].id);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("Not started");

  // Generation controls
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(0.9);

  // Schema controls
  const [useSchema, setUseSchema] = useState(false);
  const [schemaText, setSchemaText] = useState<string>(
    `{
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "answer": { "type": "string" }
        },
        "required": ["answer"]
    }`
  );
  const [schemaError, setSchemaError] = useState<string>("");
  const [systemMsg, setSystemMsg] = useState("");

  // Chat state
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

  const initProgressCallback = (report: InitProgressReport) => {
    setProgress(report.progress ?? 0);
    setProgressText(report.text ?? "");
    if (report.progress === 1) {
      setIsEngineReady(true);
      setIsLoadingModel(false);
    }
  };

  // Create engine on first mount
  useEffect(() => {
    let disposed = false;
    const init = async () => {
      try {
        setIsLoadingModel(true);
        setIsEngineReady(false);
        setProgress(0);
        setProgressText("Starting model load...");
        const engine = await CreateExtensionServiceWorkerMLCEngine(
          selectedModel,
          { initProgressCallback }
        );
        if (disposed) return;
        engineRef.current = engine;
      } catch (err) {
        console.error(err);
        setProgressText("Model load failed, check the console");
        setIsLoadingModel(false);
      }
    };
    init();
    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unloadAndRecreate(newModel: string) {
    setIsLoadingModel(true);
    setIsEngineReady(false);
    setProgress(0);
    setProgressText("Starting model load...");
    try {
      if (engineRef.current) {
        try {
          await engineRef.current.unload?.();
        } catch {
          // some adapters may not implement unload; ignore
        }
        engineRef.current = null;
      }
      const engine = await CreateExtensionServiceWorkerMLCEngine(newModel, {
        initProgressCallback,
      });
      engineRef.current = engine;
      setMessages([]);
      setOutput("");
    } catch (e) {
      console.error(e);
      setProgressText("Model load failed, check the console");
      setIsLoadingModel(false);
    }
  }

  function validateAndStringifySchema(): string | null {
    try {
      const parsed = JSON.parse(schemaText);
      if (
        typeof parsed !== "object" ||
        parsed === null ||
        (parsed.type && parsed.type !== "object")
      ) {
        setSchemaError(
          "Schema must be a JSON object and, if present, have type 'object'"
        );
        return null;
      }
      // allow either explicit type: "object" or absence but has properties
      if (!parsed.type && !parsed.properties) {
        setSchemaError("Missing 'properties' field");
        return null;
      }
      setSchemaError("");
      return JSON.stringify(parsed);
    } catch (e) {
      setSchemaError("Invalid JSON: " + (e as Error).message);
      return null;
    }
  }

  async function handleSend() {
    if (!engineRef.current) return;
    if (!isEngineReady) return;
    const engine = engineRef.current;
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: input.trim(),
    };
    const newHistory: ChatCompletionMessageParam[] = [];
    const sys = systemMsg.trim();
    if (sys.length > 0) {
      newHistory.push({ role: "system", content: sys });
    }
    for (const m of messages) {
      if (m.role !== "system") newHistory.push(m);
    }
    newHistory.push(userMessage);

    let schemaString: string | undefined;
    if (useSchema) {
      const s = validateAndStringifySchema();
      if (!s) return;
      schemaString = s;
    }

    const req: ChatCompletionRequest = {
      messages: newHistory,
      stream: true,
      temperature,
      top_p: topP,
      ...(useSchema
        ? ({
            response_format: {
              type: "json_object",
              schema: schemaString!,
            } as ResponseFormat,
          } as Partial<ChatCompletionRequest>)
        : {}),
    } as ChatCompletionRequest;

    setIsGenerating(true);
    setOutput("");
    try {
      const completion = await engine.chat.completions.create(req);
      let acc = "";
      for await (const chunk of completion as AsyncIterable<ChatCompletionChunk>) {
        const curDelta = chunk?.choices?.[0]?.delta?.content as
          | string
          | undefined;
        if (curDelta) {
          acc += curDelta;
          setOutput(acc);
        }
      }
      const finalMsg = await engine.getMessage();
      setMessages([...newHistory, { role: "assistant", content: finalMsg }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleReset() {
    try {
      await engineRef.current?.resetChat?.();
    } catch {
      /* ignore */
    }
    setMessages([]);
    setOutput("");
    setInput("");
  }

  const canSend = isEngineReady && !isGenerating && input.trim().length > 0;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>WebLLM Test Page</h1>
        <Link to="/" className={styles.link}>
          Back to Home
        </Link>
      </header>

      {/* Model controls */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Model</h2>
        <RadioGroup
          layout="horizontal"
          value={selectedModel}
          onChange={(_, data) => setSelectedModel(data.value)}
        >
          {MODELS.map((m) => (
            <Radio key={m.id} value={m.id} label={m.label} />
          ))}
        </RadioGroup>
        <div className={`${styles.row} ${styles.gap2}`}>
          <Button
            appearance="primary"
            onClick={() => unloadAndRecreate(selectedModel)}
            disabled={isLoadingModel || isGenerating}
          >
            {isEngineReady ? "Reload selected model" : "Load selected model"}
          </Button>
          {!isEngineReady && (
            <div className={`${styles.row} ${styles.flex1} ${styles.gap3}`}>
              <ProgressBar value={progress} color="brand" />
              <span
                className={`${styles.smallText} ${styles.mutedText} ${styles.nowrap}`}
              >
                {Math.round(progress * 100)}%
              </span>
            </div>
          )}
        </div>
        <div className={`${styles.smallText} ${styles.subtleText}`}>
          {progressText}
        </div>
      </section>

      {/* Generation params */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sampling parameters</h2>
        <div className={styles.gridTwoCols}>
          <Field label="temperature" hint="0-1, higher = more random">
            <div className={`${styles.row} ${styles.gap3}`}>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={temperature}
                onChange={(_, data) => setTemperature(data.value as number)}
                className={styles.flex1}
              />
              <Input
                type="number"
                step={0.05}
                min={0}
                max={1}
                value={String(temperature)}
                onChange={(e) =>
                  setTemperature(
                    Math.min(1, Math.max(0, Number(e.target.value)))
                  )
                }
                style={{ width: 88 }}
              />
            </div>
          </Field>

          <Field label="top_p" hint="0-1, higher = more diverse">
            <div className={`${styles.row} ${styles.gap3}`}>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={topP}
                onChange={(_, data) => setTopP(data.value as number)}
                className={styles.flex1}
              />
              <Input
                type="number"
                step={0.05}
                min={0}
                max={1}
                value={String(topP)}
                onChange={(e) =>
                  setTopP(Math.min(1, Math.max(0, Number(e.target.value))))
                }
                style={{ width: 88 }}
              />
            </div>
          </Field>
        </div>
      </section>

      {/* System message (optional) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>System message</h2>
        <Field
          label="System message"
          hint="Leave empty to omit the system message"
        >
          <Textarea
            resize="vertical"
            rows={4}
            value={systemMsg}
            onChange={(e) => setSystemMsg(e.target.value)}
            placeholder="Optional: e.g. You are a senior resume analysis assistant."
          />
        </Field>
      </section>

      {/* Schema section */}
      <section className={styles.section}>
        <div className={styles.rowSpread}>
          <h2 className={styles.sectionTitle}>
            Structured output (JSON Schema / TypeBox compatible)
          </h2>
          <div className={`${styles.row} ${styles.gap2}`}>
            <Label>Enable</Label>
            <Switch
              checked={useSchema}
              onChange={(_, d) => setUseSchema(d.checked)}
            />
          </div>
        </div>
        {useSchema && (
          <Field
            label="Schema JSON"
            validationMessage={schemaError || undefined}
            validationState={schemaError ? "error" : undefined}
          >
            <Textarea
              resize="vertical"
              rows={8}
              value={schemaText}
              onChange={(e) => setSchemaText(e.target.value)}
            />
          </Field>
        )}
      </section>

      {/* Chat area */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Q&A</h2>
        <Field label="Your question">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question, press Enter (Ctrl/Cmd+Enter) or click Send"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSend();
              }
            }}
          />
        </Field>
        <div className={`${styles.row} ${styles.gap2}`}>
          <Button appearance="primary" onClick={handleSend} disabled={!canSend}>
            {isGenerating ? "Generating..." : "Send"}
          </Button>
          <Button
            appearance="secondary"
            onClick={handleReset}
            disabled={isGenerating}
          >
            Reset Conversation
          </Button>
        </div>

        <div className={styles.mt2}>
          <Label>Model response</Label>
          <pre className={`${styles.mt1} ${styles.pre}`}>
            {output || (isGenerating ? "…" : "(No output yet)")}
          </pre>
        </div>
      </section>

      <footer className={`${styles.xSmallText} ${styles.mutedText}`}>
        Tip: Press Ctrl/Cmd + Enter to send quickly; when Schema is enabled the
        model will output JSON only.
      </footer>
    </div>
  );
}

export default WebLlmTestPage;

const useStyles = makeStyles({
  root: {
    padding: "16px",
    maxWidth: "896px",
    marginLeft: "auto",
    marginRight: "auto",
    display: "grid",
    rowGap: "16px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
  },
  link: {
    color: tokens.colorBrandForegroundLink,
    textDecorationLine: "none",
    ":hover": { textDecorationLine: "underline" },
  },
  section: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "16px",
    display: "grid",
    rowGap: "12px",
  },
  sectionTitle: {
    fontSize: "16px",
    fontWeight: 600,
  },
  row: {
    display: "flex",
    alignItems: "center",
  },
  rowSpread: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gap2: { columnGap: "8px" },
  gap3: { columnGap: "12px" },
  flex1: { flex: 1 },
  smallText: { fontSize: "14px" },
  xSmallText: { fontSize: "12px" },
  mutedText: { color: tokens.colorNeutralForeground3 },
  subtleText: { color: tokens.colorNeutralForeground2 },
  nowrap: { whiteSpace: "nowrap" },
  mt1: { marginTop: "4px" },
  mt2: { marginTop: "8px" },
  pre: {
    whiteSpace: "pre-wrap",
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: "12px",
    fontSize: "14px",
  },
  gridTwoCols: {
    display: "grid",
    rowGap: "24px",
    columnGap: "24px",
    gridTemplateColumns: "1fr",
    "@media (min-width: 768px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
});
