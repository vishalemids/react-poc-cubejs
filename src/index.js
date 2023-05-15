import React from "react";
import ReactDOM from "react-dom";

import cubejs from "@cubejs-client/core";
import { CubeProvider, useCubeQuery } from "@cubejs-client/react";

import { Bar } from "react-chartjs-2";

import "chartjs-plugin-colorschemes";
import { RdPu4 } from "chartjs-plugin-colorschemes/src/colorschemes/colorschemes.brewer";

import moment from "moment";

// Create an instance of Cube.js JavaScript Client
const cubejsApi = cubejs(
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE1OTQ2NjY4OTR9.0fdi5cuDZ2t3OSrPOMoc3B1_pwhnWj4ZmM3FHEX7Aus",
  {
    apiUrl:
      "https://awesome-ecom.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1"
  }
);

const App = () => {
  // Query data from Cube.js Backend
  const { resultSet, isLoading, error, progress } = useCubeQuery({
    measures: ["Orders.count"],
    dimensions: ["ProductCategories.name"],
    filters: [
      {
        member: "ProductCategories.name",
        operator: "equals",
        values: ["Beauty", "Clothing", "Computers", "Electronics"]
      }
    ],
    timeDimensions: [
      {
        dimension: "Orders.createdAt",
        granularity: "month",
        dateRange: "last 6 month"
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

  //Transform data for visualization
  const labels = resultSet
    .seriesNames({
      x: [],
      y: ["Orders.createdAt"]
    })
    .map((column) => moment(column.yValues[0]).format("MMMM"));

  const datasets = resultSet.series().map((item, i) => {
    return {
      label: item.title,
      data: item.series.map((item) => item.value)
    };
  });

  return (
    //Visualize the data
    <Bar
      data={{
        labels,
        datasets
      }}
      options={{
        legend: {
          position: "bottom",
          align: "start"
        },
        plugins: {
          colorschemes: {
            scheme: RdPu4
          }
        }
      }}
    />
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
