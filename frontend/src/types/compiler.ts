export type SupportedLanguage = 'python' | 'javascript' | 'cpp' | 'c' | 'java' | 'rust';

export interface LanguageOption {
  id: SupportedLanguage;
  name: string;
  monacoLanguage: string;
  defaultCode: string;
}

export interface ExecuteResponse {
  stdout: string;
  stderr: string;
  exit_code?: number;
  status: string;
  execution_time?: number;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    id: 'python',
    name: 'Python (3.10)',
    monacoLanguage: 'python',
    defaultCode: `# Python 3.10
def greet(name: str):
    return f"Hello, {name}! Welcome to CollabCompiler."

print(greet("World"))
`
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    monacoLanguage: 'javascript',
    defaultCode: `// JavaScript (Node.js)
function solve() {
    const message = "Real-time collaborative execution online.";
    console.log(message);
}

solve();
`
  },
  {
    id: 'cpp',
    name: 'C++ (GCC 10.2)',
    monacoLanguage: 'cpp',
    defaultCode: `// C++ 10.2
#include <iostream>
#include <vector>

int main() {
    std::vector<std::string> features = {"Real-time", "Monaco Editor", "Dynamic Control"};
    std::cout << "CollabCompiler C++ Pipeline:" << std::endl;
    for (const auto& item : features) {
        std::cout << " - " << item << std::endl;
    }
    return 0;
}
`
  },
  {
    id: 'c',
    name: 'C (GCC 10.2)',
    monacoLanguage: 'c',
    defaultCode: `// C (GCC 10.2)
#include <stdio.h>

int main() {
    printf("CollabCompiler initialized in C.\\n");
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java (OpenJDK 15)',
    monacoLanguage: 'java',
    defaultCode: `// Java 15
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from CollabCompiler Java Engine!");
    }
}
`
  },
  {
    id: 'rust',
    name: 'Rust (1.68)',
    monacoLanguage: 'rust',
    defaultCode: `// Rust 1.68
fn main() {
    let app_name = "CollabCompiler";
    println!("Compiled and executed via {} in Rust!", app_name);
}
`
  }
];