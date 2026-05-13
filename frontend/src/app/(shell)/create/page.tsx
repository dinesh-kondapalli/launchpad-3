import { CreateTokenForm } from "@/components/trading/create-token-form";

export default function CreateTokenPage() {
  return (
    <div className="w-full overflow-hidden">
      <section className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-[112rem] items-center justify-center overflow-hidden px-2 py-5 sm:px-4 lg:px-6">
        <div className="w-full max-w-[880px]">
          <CreateTokenForm />
        </div>
      </section>
    </div>
  );
}
