export type GetCsvContent = () => Promise<string | null>

/**
 * Writes CSV output to the response object. You can pass lines array or a function that will
 * construct the lines and calls the writeLine function with the line.
 */
export async function getCsvResponse(
    getCsvContent: GetCsvContent
): Promise<Response> {
    try {
        const content = await getCsvContent();
        if (content === null) {
            return new Response(null, {status: 204})
        }

        return new Response(
            content,
            {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Content-Type": "text/csv; charset=utf-8",
                    "Cache-Control": "max-age=0, s-maxage=3600, stale-while-revalidate"
                }
            }
        )
    } catch (error) {
        console.error(error)

        return new Response("CSV render error - check logs", {status: 500})
    }
}

