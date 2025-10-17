export default function RootLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-28 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}


