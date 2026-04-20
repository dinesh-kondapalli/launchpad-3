"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Wallet } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWalletStore } from "@/stores/wallet-store";
import { createToken, getConfig } from "@/lib/contract-clients/launchpad";
import { createContractClient } from "@xyz-chain/sdk";
import { RPC_ENDPOINT, REST_ENDPOINT, CHAIN_ID } from "@/lib/chain-config";
import { fromUxyz, formatUsd } from "@/lib/utils";
import { useXyzPrice } from "@/hooks/use-xyz-price";
import {
  createTokenSchema,
  type CreateTokenFormValues,
} from "@/lib/validation/trading-schemas";
import { TOKENS_QUERY_KEY } from "@/hooks/use-tokens";

export function CreateTokenForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { connection, address, refreshBalance } = useWalletStore();
  const { xyzPriceUsd } = useXyzPrice();

  // Query launchpad config to get current creation fee (no wallet needed)
  const { data: config } = useQuery({
    queryKey: ["launchpad-config"],
    queryFn: async () => {
      const { createClient } = await import("@xyz-chain/sdk");
      const readClient = await createClient({
        rpcEndpoint: RPC_ENDPOINT,
        restEndpoint: REST_ENDPOINT,
        chainId: CHAIN_ID,
      });
      const result = await getConfig(readClient);
      readClient.disconnect();
      return result;
    },
    staleTime: 60_000, // Config rarely changes
  });

  const creationFee = config?.creation_fee ?? "0";
  const creationFeeDisplay = fromUxyz(creationFee);
  const creationFeeUsd = formatUsd(creationFeeDisplay * xyzPriceUsd);

  const form = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      image: "/image.png",
      description: "",
      socialLinks: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: CreateTokenFormValues) => {
      if (!connection || !address) throw new Error("Wallet not connected");
      if (!creationFee || creationFee === "0") {
        throw new Error("Creation fee not loaded");
      }

      const contractClient = await createContractClient(
        {
          rpcEndpoint: RPC_ENDPOINT,
          restEndpoint: REST_ENDPOINT,
          chainId: CHAIN_ID,
        },
        connection,
      );

      const socialLinksArray = values.socialLinks
        ? values.socialLinks
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      return createToken(
        contractClient,
        address,
        {
          name: values.name,
          symbol: values.symbol,
          image: values.image,
          description: values.description || "",
          socialLinks: socialLinksArray,
        },
        creationFee,
      );
    },
    onMutate: () => {
      toast.loading("Creating token...", { id: "create-token" });
    },
    onSuccess: (_data, variables) => {
      toast.success("Token created!", {
        id: "create-token",
        description: "Your token is now live on the bonding curve.",
      });
      refreshBalance();
      queryClient.invalidateQueries({ queryKey: TOKENS_QUERY_KEY });

      // Notify Telegram (fire-and-forget)
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: variables.name,
          symbol: variables.symbol,
          creator: address,
          image: variables.image,
        }),
      }).catch(() => {});

      router.push("/");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to create token", {
        id: "create-token",
        description: message.includes("insufficient funds")
          ? `Insufficient balance. Creation fee is ${creationFeeUsd}`
          : message,
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="min-h-[660px] overflow-hidden rounded-[20px] border border-border bg-card p-4 shadow-[0_10px_40px_rgba(40,55,80,0.18)] sm:p-5"
      >
        <div className="mb-4 border-b border-border pb-3">
          <div className="mb-3 flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">1. Token</span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">2. Launch</span>
            <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">3. Review</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/3 bg-primary" />
          </div>
        </div>

        <div className="flex h-full w-full flex-col space-y-3.5">
          <div>
            <h2 className="text-[24px] font-semibold leading-[1.08] tracking-tight text-foreground md:text-[28px]">Let&apos;s create your token</h2>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Choose wisely, these can&apos;t be changed once the token is created.
            </p>
          </div>

          <div className="space-y-3.5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold leading-tight text-foreground">Token Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Metaplex"
                      disabled={mutation.isPending}
                      className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] text-muted-foreground">
                    Choose a memorable name that represents your project (max 32 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold leading-tight text-foreground">Ticker Symbol</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., MPLX"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      disabled={mutation.isPending}
                      className="h-9 rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] text-muted-foreground">
                    Keep it short and memorable (1-10 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold leading-tight text-foreground">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="A short description of your token (max 250 characters)"
                      rows={3}
                      disabled={mutation.isPending}
                      className="rounded-md border-border bg-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px] text-muted-foreground">
                    Keep it concise and clear (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => <input type="hidden" value={field.value} onChange={field.onChange} />}
          />

          <FormField
            control={form.control}
            name="socialLinks"
            render={({ field }) => <input type="hidden" value={field.value} onChange={field.onChange} />}
          />

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              disabled
              className="h-9 rounded-md border-border bg-muted px-4 text-xs text-muted-foreground"
            >
              Back
            </Button>

            <Button
              type="submit"
              className="h-9 rounded-md bg-primary px-4 text-xs text-primary-foreground hover:bg-primary/90"
              disabled={!connection || mutation.isPending || !config}
            >
              {!connection ? <Wallet size={16} weight="fill" /> : null}
              {!connection ? "Connect Wallet" : mutation.isPending ? "Creating..." : "Continue"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
