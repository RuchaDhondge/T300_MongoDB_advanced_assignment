# MongoDB Advanced Assignment

This repository contains the completed tasks for the **MongoDB Advanced** training module. It demonstrates schema validation using `$jsonSchema`, advanced positional array operations, atomic batch execution via `bulkWrite()`, complex relational aggregations (`$lookup`, `$unwind`, `$facet`), compound indexing strategies, query profiling, Time-To-Live (TTL) indexes, and database backup/restore workflows using `mongodump` and `mongorestore`.

## Repository Details
* **Repository:** `RuchaDhondge/T300_MongoDB_advanced_assignment`
* **Primary Database:** `company_advanced`
* **Restored Database:** `company_advanced_restore`
* **Collections:** `employees`, `departments`, `sessions`

---

## File Overview

* `mongodb-advanced-assignment.js` - Contains all `mongosh` scripts executed across Tasks 1 through 5.
* `backup-restore-commands.txt` - Command-line interface (CLI) statements executed for database backup and restoration (Task 6).
* `answers.md` - Query execution profiling metrics (`explain("executionStats")`) for Task 5.2 and multiple-choice solutions for Task 7.
* `screenshots/` - Directory containing visual verification screenshots for each completed task.

---

## Setup & Execution Steps

1. **Start MongoDB Shell:**

```bash
mongosh

```

2. **Execute Assignment Script:**

```javascript
load("mongodb-advanced-assignment.js")

```

3. **Execute Backup & Restore Workflow (Terminal):**

```bash
# Export compressed database archive
mongodump --db=company_advanced --archive=company_advanced.archive --gzip

# Restore archive into company_advanced_restore database
mongorestore --archive=company_advanced.archive --gzip --nsFrom="company_advanced.*" --nsTo="company_advanced_restore.*"

```

---

## Summary of Operations Implemented

### 1. Schema Validation & Data Creation (Task 1)

* Initialized database context using `db = db.getSiblingDB('company_advanced')`.
* Created `employees` collection with `$jsonSchema` validation rules requiring typed `name` (string), `departmentId` (int), `experience` (int), and `active` (boolean) fields.
* Inserted starting dataset using `NumberInt()` data types and verified that non-schema-compliant documents are rejected.

### 2. Advanced Array Queries & Updates (Task 2)

* Used `$elemMatch` to query sub-documents inside array fields matching compound criteria.
* Updated matching array elements using positional operators (`$`).
* Applied targeted conditional array element updates using `arrayFilters` (`$[<identifier>]`).

### 3. Bulk Write Operations (Task 3)

* Grouped multiple update and insertion requests into a single atomic call using `db.employees.bulkWrite()`.

### 4. Advanced Aggregation Pipelines (Task 4)

* **`$lookup` & `$unwind`:** Executed relational left-outer joins across `employees` and `departments` collections.
* **Array Unwinding:** Deconstructed array fields (`skills`) to compute frequency distribution counts.
* **`$facet`:** Processed multi-pipeline aggregations returning filtered document lists and summary record counts concurrently.

### 5. Indexing & Query Profiling (Task 5)

* Built compound index `{ departmentId: 1, name: 1 }` following the ESR rule.
* Captured and documented query execution metrics using `.explain("executionStats")`.
* Configured a Time-To-Live (TTL) index on `expiresAt` in the `sessions` collection (`expireAfterSeconds: 0`) for auto-expiring document management.

### 6. Backup & Restore (Task 6)

* Created a compressed archive dump of `company_advanced`.
* Restored structures and records into `company_advanced_restore` using `mongorestore` namespace mapping.

---

## Task 7 MCQ Answers Summary

[answers.md](https://github.com/RuchaDhondge/T300_MongoDB_advanced_assignment/pull/1/changes#diff-1cd7abe2cb8deb96e560d110594bb0e7e6ed7b3490241447a8bc212635fd507e)
