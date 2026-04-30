"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UploadSimple, Wallet } from "@phosphor-icons/react";
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
import { cn } from "@/lib/utils";
import { useWalletStore } from "@/stores/wallet-store";
import { createToken, getConfig } from "@/lib/contract-clients/launchpad";
import { createContractClient } from "@bwick-chain/sdk";
import { RPC_ENDPOINT, REST_ENDPOINT, CHAIN_ID } from "@/lib/chain-config";
import { fromUbwick, formatUsd } from "@/lib/utils";
import { useBwickPrice } from "@/hooks/use-bwick-price";
import {
  createTokenSchema,
  type CreateTokenFormValues,
} from "@/lib/validation/trading-schemas";
import { TOKENS_QUERY_KEY } from "@/hooks/use-tokens";

export function CreateTokenForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { connection, address, refreshBalance } = useWalletStore();
  const { bwickPriceUsd } = useBwickPrice();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Query launchpad config to get current creation fee (no wallet needed)
  const { data: config } = useQuery({
    queryKey: ["launchpad-config"],
    queryFn: async () => {
      const { createClient } = await import("@bwick-chain/sdk");
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
  const creationFeeDisplay = fromUbwick(creationFee);
  const creationFeeUsd = formatUsd(creationFeeDisplay * bwickPriceUsd);

  const form = useForm<CreateTokenFormValues>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      image: "",
      description: "",
      socialLinks: "",
    },
  });

  const imageValue = form.watch("image");
  const descriptionValue = form.watch("description");
  const descriptionLength = (descriptionValue ?? "").length;

  async function handleImageUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploadingImage(true);
    toast.loading("Uploading image...", { id: "token-image-upload" });

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        throw new Error(result.error ?? "Upload failed");
      }

      form.setValue("image", result.url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });

      toast.success("Image uploaded", { id: "token-image-upload" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error("Image upload failed", {
        id: "token-image-upload",
        description: message,
      });
    } finally {
      setIsUploadingImage(false);
    }
  }

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
        className="overflow-hidden rounded-[20px] border border-border bg-card px-4 py-3 shadow-[0_10px_40px_rgba(40,55,80,0.18)] sm:px-5 sm:py-4"
      >
        <div className="space-y-2.5">
          <div className="space-y-1">
            <h2 className="text-[1.5rem] font-semibold tracking-tight text-foreground">Create Token</h2>
            <p className="text-xs text-muted-foreground sm:text-sm">Launch a new token on BWICK&apos;s bonding curve</p>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-foreground">Token Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="My Awesome Token"
                      disabled={mutation.isPending}
                      className="h-10 rounded-md border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    The full name of your token (max 32 characters)
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
                  <FormLabel className="text-sm font-semibold text-foreground">Symbol</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="MAT"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      disabled={mutation.isPending}
                      className="h-10 rounded-md border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-muted-foreground">
                    Ticker symbol, uppercase letters and numbers only (max 10)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">Token Image</FormLabel>
                <FormControl>
                  <div className="space-y-0">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          void handleImageUpload(file);
                        }

                        event.target.value = "";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={mutation.isPending || isUploadingImage}
                      className={cn(
                        "flex min-h-[112px] w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background px-4 py-3.5 text-center transition-colors",
                        "hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60",
                        imageValue && "border-solid"
                      )}
                    >
                      {imageValue ? (
                        <div className="space-y-2">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                            <img src={imageValue} alt="Token preview" className="h-full w-full object-cover" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              {isUploadingImage ? "Uploading image..." : "Image uploaded. Click to replace"}
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP, SVG (max 2MB)</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
                            <UploadSimple size={18} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              {isUploadingImage ? "Uploading image..." : "Drop Image here or click to browse"}
                            </p>
                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP, SVG (max 2MB)</p>
                          </div>
                        </div>
                      )}
                    </button>
                    <input type="hidden" value={field.value} onChange={field.onChange} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe what makes your token unique..."
                    rows={4}
                    disabled={mutation.isPending}
                    className="min-h-[64px] rounded-md border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Up to 500 characters describing your token
                </FormDescription>
                <div className="flex items-center justify-between gap-3">
                  <FormMessage />
                  <span className="text-xs text-muted-foreground">{descriptionLength}/500</span>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="socialLinks"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-foreground">Social Links (optional)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="https://twitter.com/..., https://discord.gg/..."
                    disabled={mutation.isPending}
                    className="h-9 rounded-md border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground"
                  />
                </FormControl>
                <FormDescription className="text-xs text-muted-foreground">
                  Comma-separated URLs for your community channels
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-0 overflow-hidden rounded-lg border border-border md:grid-cols-[1fr_1.15fr]">
            <div className="bg-card px-4 py-2.5">
              <p className="text-sm font-semibold text-foreground">Creation Fee: {creationFeeDisplay} BWICK</p>
              <p className="mt-1 text-xs text-muted-foreground">This fee is paid to create the bonding curve for your token.</p>
            </div>

            <Button
              type="submit"
              className="h-full min-h-12 rounded-none bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              disabled={!connection || mutation.isPending || !config || isUploadingImage}
            >
              {!connection ? <Wallet size={16} weight="fill" /> : null}
              {!connection ? "Connect Wallet" : mutation.isPending ? "Creating..." : "Create Token"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
