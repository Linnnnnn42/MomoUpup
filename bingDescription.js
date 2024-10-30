export async function getDescription(word) {
    try {
        const response = await fetch(
            `https://cn.bing.com/dict/search?q=${word}`,
            {
                method: 'GET',
            });
        const htmlString = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        // const description = doc.head.childNodes[6].content;
        const description = doc.head.children[5].getAttribute('content');
        return description;
    } catch (error) {
        console.error(error);
    }
}
