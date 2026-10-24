# FindexAuth API Backend

This project serves as the robust backend for the custom C++ authentication client. It implements the necessary routing, backwards-compatible encryption decoding, and JSON formatting to act as a seamless drop-in replacement for the original lost API.

## Features

- Complete backwards compatibility with the existing C++ client.
- Accurate Vigenere cipher decoding for the `deviceid` and `shahash`.
- Carefully constructed collision-free `entryhash` decoding for the `socket` response requirement.
- Prepared statement SQLite logic to prevent injection attacks.
- Robust URL encoded form parsing.

## Requirements

- Node.js (v18+)

## Installation

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

## Running the Server

Start the server using `ts-node`:
\`\`\`bash
npx tsx src/server.ts
\`\`\`

*(The server will automatically generate the SQLite database and schema upon first boot).*

## Testing

To run the compatibility and integration tests:
\`\`\`bash
npx tsx tests/run_tests.ts
\`\`\`
