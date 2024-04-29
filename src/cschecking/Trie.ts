// Trie.ts
import { levenshteinDistance } from './Levenshtein';

export class TrieNode {
    children: { [key: string]: TrieNode };
    isEndOfWord: boolean;

    constructor() {
        this.children = {};
        this.isEndOfWord = false;
    }
}

export class Trie {
    root: TrieNode;

    constructor() {
        this.root = new TrieNode();
    }

    insert(word: string) {
        let node = this.root;
        for (const char of word) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isEndOfWord = true;
    }

    logAllChildren() {
        this._logChildrenRecursive(this.root, '');
    }

    private _logChildrenRecursive(node: TrieNode, prefix: string) {
        if (!node) return;

        console.log(`Node at prefix "${prefix}": ${Object.keys(node.children)}`);

        for (const char in node.children) {
            const childNode = node.children[char];
            const newPrefix = prefix + char;
            this._logChildrenRecursive(childNode, newPrefix);
        }
    }


    private findWordsRecursive(node: TrieNode, prefix: string, threshold: number, targetWord: string, similarWords: string[]) {
        if (!node) return;

        const distance = levenshteinDistance(prefix, targetWord);
        if (prefix.length > 0 && distance <= threshold) {
            similarWords.push(prefix);
        }
    
        for (const char in node.children) {
            const childNode = node.children[char];
            const newPrefix = prefix + char;
    
            if (distance <= threshold) {
                this.findWordsRecursive(childNode, newPrefix, threshold, targetWord, similarWords);
            } else {
                // If the Levenshtein distance of the prefix exceeds the threshold,
                // we don't need to explore further
                break;
            }
        }
    }

    findSimilarWords(word: string, threshold: number): string[] {
        const similarWords: string[] = [];
        this.findWordsRecursive(this.root, '', threshold, word, similarWords);
        return similarWords;
    }

/*     getAllWords(): string[] {
        const words: string[] = [];

        // Recursive function to traverse the trie and collect words
        function collectWords(node: TrieNode, prefix: string) {
            if (node.isEndOfWord) {
                words.push(prefix);
            }
            for (const char in node.children) {
                collectWords(node.children[char], prefix + char);
            }
        }

        // Start collecting words from the root
        collectWords(this.root, '');

        return words;
    } */
}
