export function checkSentenceEnd(content: string) {
    return /[.|!|?|:|-|。|！|？|：]/.test(content);
}

export class ResCache {
    #content = '';

    get content() {
        return this.#content;
    }

    push(words: string) {
        this.#content += words;
    }

    flush() {
        this.#content = '';
    }
}