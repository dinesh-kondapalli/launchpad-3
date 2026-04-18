import { CreateTokenForm } from "@/components/trading/create-token-form";

export default function CreateTokenPage() {
  return (
    <div className="w-full">
      <section className="mx-auto flex h-[calc(100vh-11.5rem)] w-full max-w-[120rem] items-center justify-center px-4 py-0 sm:px-6 lg:px-8">
        <div className="w-full max-w-[660px]">
          <CreateTokenForm />
        </div>
      </section>
    </div>
  );
}
