import { OrderPageTabs } from "@/components/admin/OrderPageTabs";
import { FulfillmentView } from "./_views/FulfillmentView";
import { OrderListView } from "./_views/OrderListView";
import { PickingView } from "./_views/PickingView";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; tab?: string }>;
}) {
  const { status: filterStatus, tab } = await searchParams;

  let content;
  if (tab === "fulfillment") {
    content = <FulfillmentView />;
  } else if (tab === "picking") {
    content = <PickingView />;
  } else {
    content = <OrderListView filterStatus={filterStatus} />;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        訂單管理
      </h1>
      <div className="mt-4">
        <OrderPageTabs />
      </div>
      {content}
    </div>
  );
}
