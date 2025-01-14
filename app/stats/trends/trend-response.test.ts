import {getCsvResponse} from "./trend-response";

test("Outputs 200 and CSV headers on string content", async () => {
    const response = await getCsvResponse(async () => 'test');

    expect(response.status).toEqual(200);
    expect(response.headers.get("Access-Control-Allow-Origin")).toEqual("*");
    expect(response.headers.get("Content-Type")).toEqual("text/csv; charset=utf-8");
    expect(response.headers.get("Cache-Control")).toEqual("max-age=0, s-maxage=3600, stale-while-revalidate");
    expect(await response.text()).toEqual("test")
});

test("Outputs 204 on null content", async () => {
    const response = await getCsvResponse(async () => null);
    expect(response.status).toEqual(204);
});

test("Outputs 500 on thrown error", async () => {
    const error = jest.spyOn(global.console, 'error').mockImplementation(() => {
    });

    const response = await getCsvResponse(async () => {
         throw new Error('test');
    });
    expect(response.status).toEqual(500);
    expect(await response.text()).toEqual("CSV render error - check logs")

    expect(error).toHaveBeenCalledWith(new Error('test'));

    error.mockReset();
});
