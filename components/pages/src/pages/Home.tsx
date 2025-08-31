import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Divider,
  Subtitle1,
  Text,
  Title3,
  makeStyles,
} from "@fluentui/react-components";
import { ArrowRight24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--colorNeutralBackground2)",
  },
  container: {
    width: "100%",
    maxWidth: "720px",
  },
  actions: {
    display: "flex",
    gap: "12px",
  },
});

import { useNavigate } from "react-router-dom";

function Home() {
  const styles = useStyles();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Card>
          <CardHeader
            header={<Title3>Welcome to Goose Glance</Title3>}
            description={<Subtitle1>轻量、友好的网页信息速览工具</Subtitle1>}
          />

          <Divider appearance="subtle" />

          <div className="my-8">
            <Text>这是首页（Home）。</Text>
          </div>

          <CardFooter>
            <div className={styles.actions}>
              <Button
                appearance="primary"
                icon={<ArrowRight24Regular />}
                onClick={() => navigate("/webllm-test")}
              >
                前往 WebLLM Test Page
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Home;
