import { CreateTokenForm } from "@/components/trading/create-token-form";

export default function CreateTokenPage() {
  return (
    <div className="w-full overflow-hidden">
      <section className="mx-auto flex h-[calc(100vh-11.5rem)] w-full max-w-[120rem] items-center justify-center overflow-hidden px-2 py-0 sm:px-4 lg:px-6">
        <div className="w-full max-w-[1000px]">
          <CreateTokenForm />
        </div>
      </section>
    </div>
  );
}
