export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-text-primary">
        商品管理
      </h1>
      <div className="mt-12 rounded-xl border border-metal-silver/20 bg-concrete/10 p-8 text-center">
        <p className="text-4xl">🏗️</p>
        <p className="mt-4 text-lg font-medium text-text-secondary">
          商品管理功能開發中
        </p>
        <p className="mt-2 text-sm text-text-muted">
          目前商品資料由種子檔案和匯入腳本管理，CRUD 介面將在後續版本加入。
        </p>
      </div>
    </div>
  );
}
