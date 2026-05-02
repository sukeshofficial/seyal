import Layout from "./layout";
import { SkeletonCard } from "../../components/SkeletonCard";

export default function DashboardPage() {
  return (
    <>
      <h1>Dashboard</h1>
      <SkeletonCard />
      <Layout />
    </>
  );
}
