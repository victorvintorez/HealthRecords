import { z } from 'zod';

export const FileType = {
	Image: z.enum([
		'image/jpeg',
		'image/gif',
		'image/png',
		'image/tiff',
		'image/apng',
		'image/avif',
		'image/bmp',
		'image/vnd.microsoft.icon',
		'image/svg+xml',
		'image/webp',
	]),
	Video: z.enum([
		'video/x-msvideo',
		'video/mp4',
		'video/mpeg',
		'video/ogg',
		'video/mp2t',
		'video/webm',
		'video/3gpp',
		'video/3gpp2',
	]),
	Audio: z.enum([
		'audio/aac',
		'audio/midi',
		'audio/x-midi',
		'audio/mpeg',
		'audio/ogg',
		'audio/wav',
		'audio/webm',
		'audio/3gpp',
		'audio/3gpp2',
	]),
	Text: z.enum([
		'text/plain',
		'text/css',
		'text/csv',
		'text/html',
		'text/calendar',
		'text/javascript',
		'text/xml',
	]),
	isImage: (file: File) => FileType.Image.safeParse(file.type).success,
	isVideo: (file: File) => FileType.Video.safeParse(file.type).success,
	isAudio: (file: File) => FileType.Audio.safeParse(file.type).success,
	isText: (file: File) => FileType.Text.safeParse(file.type).success,
};

export const FileSchema = z
	.custom<File>()
	.refine((file) => file.size <= 1024 * 1024 * 10); // 10Mb

export const ImageFileSchema = FileSchema.refine((file) =>
	FileType.isImage(file),
);

export const VideoFileSchema = FileSchema.refine((file) =>
	FileType.isVideo(file),
);

export const AudioFileSchema = FileSchema.refine((file) =>
	FileType.isAudio(file),
);

export const TextFileSchema = FileSchema.refine((file) =>
	FileType.isText(file),
);

export const AuthRouteParams = z.object({
	redirect: z.string().optional(),
});

export const IndexRouteParams = z.object({
	fullname: z.string().optional(),
});