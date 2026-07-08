export default function SectionHeading({ title, action }) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-2 rounded-full bg-primary" />
        <h2 className="font-headline-md text-headline-md text-on-surface">{title}</h2>
      </div>
      {action}
    </div>
  );
}
