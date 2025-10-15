import { FlashCardData, AttemptHistory } from "@/components/FlashCard";

// Re-export types for convenience
export type { FlashCardData, AttemptHistory };

// This will be populated from Notion API
// For now, using sample data based on the structure you provided
export const sampleCards: FlashCardData[] = [
  {
    id: "1",
    title: "13. Roman to Integer",
    leetcodeUrl: "https://leetcode.com/problems/roman-to-integer/",
    description: "Convert a Roman numeral string to an integer. Roman numerals are represented by seven symbols: I, V, X, L, C, D and M.",
    topic: "Hash Maps",
    attempts: [
      {
        date: "2025-01-15T10:30:00Z",
        timeTaken: 480,
        solved: true,
      },
    ],
    code: `var romanToInt = function(s) {
    var values = {
        "I": 1,
        "V": 5,
        "X": 10,
        "L": 50,
        "C": 100,
        "D": 500,
        "M": 1000
    };
    var value = 0;
    for(let i=0;i<s.length;i++){
        if(i < s.length && values[s[i]] < values[s[i+1]]){
            value += values[s[i+1]] - values[s[i]];
            i++;
        } else {
            value += values[s[i]];
        }
    }

    return value;
};`,
    explanation: `1. Iterate through each character of the Roman numeric
2. For the given \`ith\` character:
    1. The current character's int value is less than the next one (for example, \`IV\` is \`1,5\` ), add the difference between the \`i+1th\` and \`ith\` value to the return value (AND iterate past the \`i+1th\` value since that value has already been considered)
    2. Else, add the \`ith\` numeric value to the return value (Egs: \`CX\` is \`100, 50\`, so C (100) is added directly)`,
  },
  {
    id: "2",
    title: "1. Two Sum",
    leetcodeUrl: "https://leetcode.com/problems/two-sum/",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    topic: "Hash Maps",
    code: `var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
};`,
    explanation: `1. Create a hash map to store numbers we've seen
2. For each number:
    - Calculate its complement (target - current number)
    - If complement exists in map, return both indices
    - Otherwise, add current number and index to map
3. Time complexity: O(n), Space complexity: O(n)`,
  },
  {
    id: "3",
    title: "217. Contains Duplicate",
    leetcodeUrl: "https://leetcode.com/problems/contains-duplicate/",
    description: "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
    topic: "Arrays & Strings",
    code: `var containsDuplicate = function(nums) {
    const seen = new Set();
    
    for (const num of nums) {
        if (seen.has(num)) {
            return true;
        }
        seen.add(num);
    }
    
    return false;
};`,
    explanation: `1. Use a Set to track seen numbers
2. For each number:
    - If it exists in the set, we found a duplicate
    - Otherwise, add it to the set
3. If we finish the loop without finding duplicates, return false
4. Time complexity: O(n), Space complexity: O(n)`,
  },
];

// Function to fetch from Notion API
export async function fetchCardsFromNotion(
  databaseId: string
): Promise<FlashCardData[]> {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase credentials not found');
      return sampleCards;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase.functions.invoke('fetch-notion-cards', {
      body: { databaseId },
    });

    if (error) {
      console.error('Error fetching from Notion:', error);
      return sampleCards;
    }

    return data.flashcards || sampleCards;
  } catch (error) {
    console.error('Error in fetchCardsFromNotion:', error);
    return sampleCards;
  }
}
