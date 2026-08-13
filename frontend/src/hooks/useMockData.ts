import { useEffect, useState, useCallback } from "react";
import { loadMockData, mergeMockData, MockStore, MockPatient, MockAppointment } from "../utils/mockData";

export function useMockData(): MockStore {
  const [data, setData] = useState<MockStore>(() => loadMockData());

  useEffect(() => {
    const handler = () => setData(loadMockData());
    window.addEventListener("hms-mock-data-changed", handler);
    return () => window.removeEventListener("hms-mock-data-changed", handler);
  }, []);

  return data;
}

export function useMutateMockData() {
  const addPatient = useCallback((p: Omit<MockPatient, "id" | "patientNumber" | "createdAt">) => {
    const data = loadMockData();
    const newPatient: MockPatient = {
      ...p,
      id: `p${Date.now()}`,
      patientNumber: `HMS-${1007 + data.patients.length}`,
      createdAt: new Date().toISOString(),
    };
    return mergeMockData({ patients: [newPatient, ...data.patients] });
  }, []);

  const addAppointment = useCallback((a: Omit<MockAppointment, "id">) => {
    const data = loadMockData();
    const newApt: MockAppointment = { ...a, id: `a${Date.now()}` };
    return mergeMockData({ appointments: [newApt, ...data.appointments] });
  }, []);

  return { addPatient, addAppointment };
}
