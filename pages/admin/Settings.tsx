import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Store, Phone, Image as ImageIcon, MessageSquare, Save } from "lucide-react";
import { 
  useGetStoreSettings, 
  getGetStoreSettingsQueryKey, 
  useUpdateStoreSettings 
} from "@workspace/api-client-react";

const formSchema = z.object({
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  cnpj: z.string().optional().nullable(),
  logoUrl: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
  whatsappNumber: z.string().min(1, "Número do WhatsApp é obrigatório"),
  phoneAdditional: z.string().optional().nullable(),
  whatsappMessage: z.string().min(1, "Mensagem inicial é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetStoreSettings();
  const updateSettings = useUpdateStoreSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      cnpj: "",
      logoUrl: "",
      whatsappNumber: "",
      phoneAdditional: "",
      whatsappMessage: "",
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        companyName: settings.companyName,
        cnpj: settings.cnpj,
        logoUrl: settings.logoUrl || "",
        whatsappNumber: settings.whatsappNumber,
        phoneAdditional: settings.phoneAdditional,
        whatsappMessage: settings.whatsappMessage,
      });
    }
  }, [settings, form]);

  const onSubmit = (data: FormValues) => {
    updateSettings.mutate(
      { data },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetStoreSettingsQueryKey() });
          toast({
            title: "Sucesso",
            description: "Configurações salvas com sucesso.",
          });
        },
        onError: () => {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao salvar as configurações.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const watchLogoUrl = form.watch("logoUrl");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações da Loja</h1>
        <p className="text-muted-foreground">
          Gerencie as informações e preferências da sua loja.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Dados principais do seu estabelecimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Loja</FormLabel>
                    <FormControl>
                      <Input placeholder="Frootz" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0000-00" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contato
              </CardTitle>
              <CardDescription>
                Números de telefone para atendimento e pedidos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do WhatsApp (com DDD e código do país, ex: 5511999999999)</FormLabel>
                    <FormControl>
                      <Input placeholder="5511999999999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneAdditional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Adicional (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 3333-3333" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Identidade Visual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Identidade Visual
              </CardTitle>
              <CardDescription>
                Personalize a aparência da sua loja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Logo (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://exemplo.com/logo.png" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {watchLogoUrl && (
                <div className="mt-4 p-4 border rounded-md flex justify-center bg-muted/20">
                  <img 
                    src={watchLogoUrl} 
                    alt="Preview da Logo" 
                    className="max-h-20 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    onLoad={(e) => {
                      (e.target as HTMLImageElement).style.display = 'block';
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mensagem Padrão */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Mensagem Padrão
              </CardTitle>
              <CardDescription>
                Texto enviado inicialmente no WhatsApp junto com o pedido
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="whatsappMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem inicial do WhatsApp</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Olá! Gostaria de fazer um pedido:" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={updateSettings.isPending}
            >
              {updateSettings.isPending ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}