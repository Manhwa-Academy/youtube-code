"use client";

import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";

import { trpc } from "@/trpc/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ResponsiveModal } from "@/components/responsive-modal";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface PlaylistCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialVideoIds?: string[];
  playlistId?: string; // ❗ optional: playlist hiện tại
}

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên danh sách"),
});

export const PlaylistCreateModal = ({
  open,
  onOpenChange,
  initialVideoIds = [],
  playlistId,
}: PlaylistCreateModalProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const utils = trpc.useUtils();

  const createMix = trpc.playlists.createMixPlaylist.useMutation({
    onSuccess: () => {
      utils.playlists.getPublicMixPlaylists.invalidate();
      toast.success("Tạo danh sách kết hợp thành công!");
      form.reset();
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message || "Đã xảy ra lỗi"),
  });

  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      utils.playlists.getPublicMixPlaylists.invalidate();
      toast.success("Thêm video vào danh sách thành công!");
      onOpenChange(false);
    },
    onError: (err) => toast.error(err.message || "Đã xảy ra lỗi"),
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!initialVideoIds.length) return;

    if (playlistId) {
      // ✅ Thêm video vào playlist hiện tại
      initialVideoIds.forEach((videoId) => {
        addVideo.mutate({ playlistId, videoId });
      });
    } else {
      // ✅ Tạo playlist mới với video hiện tại
      createMix.mutate({ name: values.name, videoIds: initialVideoIds });
    }
  };

  useEffect(() => {
    if (open) form.reset();
  }, [open]);

  return (
    <ResponsiveModal
      title={playlistId ? "Thêm video vào danh sách" : "Tạo danh sách kết hợp"}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {!playlistId && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên danh sách</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ví dụ: Video yêu thích" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={createMix.isPending || addVideo.isPending}>
              {playlistId ? "Thêm vào danh sách" : "Tạo"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};