import { getAlarms } from "@/app/actions";
import AlarmClient from "./AlarmClient";

export default async function AlarmPage() {
  const alarms = await getAlarms();

  return <AlarmClient alarms={alarms} />;
}