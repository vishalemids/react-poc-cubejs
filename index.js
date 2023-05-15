import React from "react";
import ReactDOM from "react-dom";
import cubejs from "@cubejs-client/core";
import { CubeProvider, useCubeQuery } from "@cubejs-client/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import moment from "moment";

const cubejsApi = cubejs(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTQ2NjY4OTR9.0fdi5cuDZ2t3OSrPOMoc3B1_pwhnWj4ZmM3FHEX7Aus",
  {
    apiUrl:
      "https://awesome-ecom.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1"
  }
);

const App = () => {
  const { resultSet, isLoading, error, progress } = useCubeQuery({
    measures: ["Orders.count"],
    timeDimensions: [
      {
        dimension: "Orders.createdAt",
        granularity: "month",
        dateRange: "last year"
      }
    ]
  });

  if (isLoading) {
    return (
      <div>
        {(progress && progress.stage && progress.stage.stage) || "Loading..."}
      </div>
    );
  }

  if (error) {
    return <div>{error.toString()}</div>;
  }

  if (!resultSet) {
    return null;
  }

  const dataSource = resultSet.tablePivot();

  return (
    <LineChart
      width={600}
      height={300}
      data={dataSource}
      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
    >
      <XAxis
        dataKey="Orders.createdAt.month"
        tickFormatter={(tickItem) => moment(tickItem).format("MMM YYYY")}
      />
      <YAxis />
      <CartesianGrid strokeDasharray="3 3" />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="Orders.count"
        stroke="#8884d8"
        activeDot={{ r: 8 }}
      />
    </LineChart>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <CubeProvider cubejsApi={cubejsApi}>
      <App />
    </CubeProvider>
  </React.StrictMode>,
  rootElement
);
