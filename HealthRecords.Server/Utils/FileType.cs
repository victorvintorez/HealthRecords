namespace HealthRecords.Server.Utils;

public static class FileType {
    private static readonly string[] Image = [
        "image/jpeg", "image/gif", "image/png", "image/tiff", "image/apng", "image/avif", "image/bmp",
        "image/vnd.microsoft.icon", "image/svg+xml", "image/webp"
    ];

    private static readonly string[] Video = [
        "video/x-msvideo", "video/mp4", "video/mpeg", "video/ogg", "video/mp2t", "video/webm", "video/3gpp",
        "video/3gpp2"
    ];

    private static readonly string[] Audio = [
        "audio/aac", "audio/midi", "audio/x-midi", "audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/3gpp",
        "audio/3gpp2"
    ];

    private static readonly string[] Text = [
        "text/plain", "text/css", "text/csv", "text/html", "text/calendar", "text/javascript", "text/xml"
    ];

    public static bool IsType(string mimeType, Type fileType) {
        return fileType switch {
            Type.Image => Image.Contains(mimeType),
            Type.Video => Video.Contains(mimeType),
            Type.Audio => Audio.Contains(mimeType),
            Type.Text => Text.Contains(mimeType),
            _ => false
        };
    }

    public enum Type {
        Image,
        Video,
        Audio,
        Text,
    }
}