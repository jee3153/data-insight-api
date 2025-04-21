# data-insight-api
- [Data Insight API](#data-insight-api)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [API Specification](#api-documents)    
- [Built with](#built-with)
## Data Insight API
Data Insight API provides restfulAPI that uploads csv file and output summaries about the csv file.

## Getting Started
### Prerequisites
- Node.js (version >= 20)
- npm (version >= 10.8.2)    
- docker desktop installed

### Installation
1. After clone repository, navigate to the project directory.
2. Install dependencies
```bash
npm install
```
3. Pull postgres image and run
```bash
docker pull postgres:latest
docker run --name my-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=postgres \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  -d postgres
```
4. Schema Sync with db
```bash
npm run db:deploy
```
5. Run Application
```bash
npm run start
```
6. Run unit/integration tests
```bash
npm run test
```

## API Specification
**POST http://localhost:3000/upload:** uploads csv file, analyse, and persist summary of analysis.
**Body Parameter**
- file: File
- userId: string

e.g. `curl -F "file=@/Users/myself/Descktop/filename.csv" -F "userId=user_262" http://localhost:3000/upload`

**GET http://localhost:3000/analysis/:id:** fetch specific analysis summary of certain id.

**GET http://localhost:3000/results:** fetch analysis summaries based on filter. If filter wasn't provided, it will fetch all available summaries. 
**Filter Queries**
- userId: string
- since: timestamp in UTC

e.g. `http://localhost:3000/results?userId=user-123&since=2025-04-14 12:55:58.270`

## Built With
- Typescript
- node.js
- express.js
- vitest
- supertest
- testcontainer
- postgres
- prisma
- git action ci pipeline