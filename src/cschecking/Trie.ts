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

    private findWordsRecursive(node: TrieNode, prefix: string, threshold: number, targetWord: string, similarWords: string[]) {
        if (!node) return;

        if (prefix.length > 0 && levenshteinDistance(prefix, targetWord) <= threshold) {
            similarWords.push(prefix);
        }

        for (const char in node.children) {
            const childNode = node.children[char];
            const newPrefix = prefix + char;
            const distance = levenshteinDistance(newPrefix, targetWord);

            if (distance <= threshold) {
                this.findWordsRecursive(childNode, newPrefix, threshold, targetWord, similarWords);
            }
        }
    }

    findSimilarWords(word: string, threshold: number): string[] {
        const similarWords: string[] = [];
        this.findWordsRecursive(this.root, '', threshold, word, similarWords);
        return similarWords;
    }
}
