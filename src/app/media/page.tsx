import { EditionsService } from "@/api/editionApi";
import { MediaService } from "@/api/mediaApi";
import ErrorAlert from "@/app/components/error-alert";
import PageShell from "@/app/components/page-shell";
import { MediaViewer, MediaViewerItem } from "@/app/media/media-viewer";
import { serverAuthProvider } from "@/lib/authProvider";
import { getEncodedResourceId } from "@/lib/halRoute";
import { Edition } from "@/types/edition";
import { NotFoundError, parseErrorMessage } from "@/types/errors";
import { MediaContent } from "@/types/mediaContent";

interface MediaPageProps {
    readonly searchParams: Promise<{ url?: string | string[] }>;
}

function firstParam(value: string | string[] | undefined): string | null {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
}

function getMediaUrl(content: MediaContent): string {
    return content.url ?? content.id ?? "";
}

function toMediaViewerItem(content: MediaContent): MediaViewerItem {
    return {
        id: content.id,
        type: content.type,
        url: getMediaUrl(content),
    };
}

function getEditionUri(content: MediaContent): string | null {
    const linkedEdition = content.link?.("edition")?.href;
    if (linkedEdition) {
        return linkedEdition;
    }

    if (typeof content.edition === "string" && content.edition.length > 0) {
        return content.edition;
    }

    return null;
}

function getMediaTitle(media: MediaContent | null): string {
    if (!media) {
        return "Media";
    }

    return media.type ? `Media ${media.type}` : "Media";
}

export default async function MediaPage({ searchParams }: MediaPageProps) {
    const mediaService = new MediaService(serverAuthProvider);
    const editionService = new EditionsService(serverAuthProvider);
    const mediaUrl = firstParam((await searchParams).url);

    let media: MediaContent | null = null;
    let edition: Edition | null = null;
    let mediaItems: MediaContent[] = [];
    let error: string | null = null;

    if (!mediaUrl) {
        error = "No media URL was provided.";
    }

    if (mediaUrl && !error) {
        try {
            media = await mediaService.getMediaById(mediaUrl);
        } catch (e) {
            console.error("Failed to fetch media:", e);
            error = e instanceof NotFoundError
                ? "This media does not exist."
                : parseErrorMessage(e);
        }
    }

    if (media && !error) {
        const editionUri = getEditionUri(media);

        if (editionUri) {
            try {
                edition = await editionService.getEditionByUri(editionUri);
                mediaItems = await mediaService.getMediaByEdition(editionUri);
            } catch (e) {
                console.error("Failed to fetch media edition data:", e);
                error = parseErrorMessage(e);
            }
        } else {
            mediaItems = [media];
        }
    }

    if (error || !media) {
        return (
            <PageShell
                eyebrow="Media"
                title="Media not found"
                description="The requested media could not be loaded."
            >
                <ErrorAlert message={error ?? "This media does not exist."} />
            </PageShell>
        );
    }

    const normalizedMediaItems = mediaItems.length > 0 ? mediaItems : [media];
    const activeIndex = Math.max(
        normalizedMediaItems.findIndex((item) => getMediaUrl(item) === getMediaUrl(media)),
        0
    );
    const editionId = getEncodedResourceId(edition?.uri);

    return (
        <PageShell
            eyebrow="Media"
            title={getMediaTitle(media)}
            description="View this media item and move through the other media from the same edition."
        >
            <MediaViewer
                media={toMediaViewerItem(media)}
                mediaItems={normalizedMediaItems.map(toMediaViewerItem)}
                activeIndex={activeIndex}
                edition={edition
                    ? {
                        id: editionId,
                        year: edition.year,
                        venueName: edition.venueName,
                        description: edition.description,
                    }
                    : null}
            />
        </PageShell>
    );
}
