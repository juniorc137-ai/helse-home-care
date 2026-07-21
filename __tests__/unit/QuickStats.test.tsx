import { render, screen } from "../testUtils";
import { QuickStats } from "../../src/components/QuickStats";

describe("<QuickStats />", () => {
  it("renderiza um card por estatística com valor e rótulo", () => {
    render(
      <QuickStats
        stats={[
          { key: "patients", label: "Pacientes", value: 20, icon: "account-group-outline" },
          { key: "tasksToday", label: "Tarefas hoje", value: 5, icon: "calendar-check-outline" },
        ]}
      />,
    );
    expect(screen.getByTestId("quick-stat-patients")).toBeTruthy();
    expect(screen.getByText("20")).toBeTruthy();
    expect(screen.getByText("Pacientes")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("Tarefas hoje")).toBeTruthy();
  });
});
