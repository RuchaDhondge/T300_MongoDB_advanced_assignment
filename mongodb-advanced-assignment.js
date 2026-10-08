// ============================================================================
// TASK 1: SCHEMA VALIDATION AND DATA CREATION
// ============================================================================

// Step 1: Select fresh database
use company_advanced;

// Clean existing collection if re-executing
db.employees.drop();

// Step 2: Create validated collection with $jsonSchema
db.createCollection("employees", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "departmentId", "experience", "active"],
      properties: {
        name: { bsonType: "string" },
        departmentId: { bsonType: "int" },
        experience: { bsonType: "int" },
        active: { bsonType: "bool" }
      }
    }
  }
});

// Step 3: Insert valid starting dataset
db.employees.insertMany([
  {
    _id: 1,
    name: "John",
    departmentId: NumberInt(10),
    skills: ["Java", "MongoDB"],
    experience: NumberInt(4),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Expired", expiryYear: NumberInt(2026) }
    ]
  },
  {
    _id: 2,
    name: "Alice",
    departmentId: NumberInt(10),
    skills: ["Python", "MongoDB"],
    experience: NumberInt(6),
    active: true,
    certifications: [
      { name: "MongoDB", status: "Active", expiryYear: NumberInt(2028) }
    ]
  },
  {
    _id: 3,
    name: "David",
    departmentId: NumberInt(20),
    skills: ["Communication"],
    experience: NumberInt(3),
    active: false,
    certifications: [
      { name: "Communication", status: "Active", expiryYear: NumberInt(2027) }
    ]
  }
]);

// Verify inserted employee data
db.employees.find()

// Step 4: Test validation rule (This write must fail)
try {
  db.employees.insertOne({
    _id: 99,
    name: 123,
    departmentId: "HR",
    experience: "one",
    active: "yes"
  });
} catch (e) {
  print("Validation successfully rejected invalid document: " + e.message);
}

// Verify Task 1

db.employees.countDocuments();
db.employees.find().sort({ _id: 1 }).forEach(printjson);


// ============================================================================
// TASK 2: ADVANCED ARRAY QUERIES AND UPDATES
// ============================================================================

// 2.1 Find matching array object using $elemMatch
db.employees.find({
  certifications: {
    $elemMatch: { name: "MongoDB", status: "Active" }
  }
});

// 2.2 Update one matching array element using positional $ operator
db.employees.updateOne(
  { _id: 1, "certifications.name": "MongoDB" },
  { $set: { "certifications.$.status": "Active" } }
);

// 2.3 Update selected array elements using arrayFilters
db.employees.updateOne(
  { _id: 1 },
  { $set: { "certifications.$[c].status": "Renewal Due" } },
  { arrayFilters: [{ "c.expiryYear": { $lt: 2027 } }] }
);

// Verify Task 2
db.employees.find(
  { _id: { $in: [1, 2]} },
  { _id: 1, name: 1, certifications: 1 }
).sort({ _id: 1 }).forEach(printjson);

// ============================================================================
// TASK 3: BULK WRITE OPERATIONS
// ============================================================================

db.employees.bulkWrite([
  {
    updateOne: {
      filter: { _id: 1 },
      update: { $inc: { experience: NumberInt(1) } }
    }
  },
  {
    updateOne: {
      filter: { _id: 2 },
      update: { $set: { active: false } }
    }
  },
  {
    insertOne: {
      document: {
        _id: 4,
        name: "Emma",
        departmentId: NumberInt(20),
        skills: ["Excel"],
        experience: NumberInt(2),
        active: true,
        certifications: [
          { name: "Excel", status: "Active", expiryYear: NumberInt(2026) }
        ]
      }
    }
  }
]);

// Verify Task 3
db.employees.findOne(
  { _id: 1 },
  { _id: 1, name: 1, experience: 1 }
);

db.employees.findOne(
  { _id: 2 },
  { _id: 1, name: 1, active: 1 }
);

db.employees.countDocuments();


// ============================================================================
// TASK 4: ADVANCED AGGREGATION
// ============================================================================

// Step 1: Setup departments collection
db.departments.drop();
db.departments.insertMany([
  { _id: NumberInt(10), name: "Engineering" },
  { _id: NumberInt(20), name: "HR" }
]);

// 4.1 Join employees with departments ($lookup + $unwind)
db.employees.aggregate([
  {
    $lookup: {
      from: "departments",
      localField: "departmentId",
      foreignField: "_id",
      as: "dept"
    }
  },
  { $unwind: "$dept" },
  {
    $project: {
      _id: 0,
      name: 1,
      departmentName: "$dept.name"
    }
  },
  { $sort: { name: 1 } }
]).forEach(printjson);

// 4.2 Count employees for each skill
db.employees.aggregate([
  { $unwind: "$skills" },
  {
    $group: {
      _id: "$skills",
      count: { $sum: 1 }
    }
  },
  {
    $sort: {
      count: -1,
      _id: 1
    }
  }
]).forEach(printjson);

// 4.3 Return active employees and count in one query ($facet)
db.employees.aggregate([
  { $match: { active: true } },
  {
    $facet: {
      activeEmployees: [
        { $sort: { name: 1 } },
        { $project: { _id: 0, name: 1 } }
      ],
      summary: [
        { $count: "totalActiveCount" }
      ]
    }
  }
]).forEach(printjson);


// ============================================================================
// TASK 5: INDEXING AND QUERY PERFORMANCE
// ============================================================================

// 5.1 Create Compound Index
db.employees.createIndex({ departmentId: 1, name: 1 });
db.employees.getIndexes();

// 5.2 Read explain("executionStats")
db.employees
  .find({ departmentId: NumberInt(10) })
  .sort({ name: 1 })
  .explain("executionStats");

// 5.3 Create TTL Index
db.sessions.drop();
db.sessions.insertOne({
  _id: 1,
  userName: "John",
  expiresAt: new Date(Date.now() + 600000)
});
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.sessions.getIndexes();

