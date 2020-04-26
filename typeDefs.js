const { gql } = require(`apollo-server`);

module.exports = gql`
  enum Gender {
    Male
    Female
    Other
  }
  enum Religion {
    Hinduism
    Islam
    Sikhism
    Christianity
    Jainism
    Buddhism
    Other
  }
  enum Caste {
    General
    OBC
    SC
    ST
    Other
  }

  input NameInputObject {
    first: String
    last: String
  }
  input ParentInputObject {
    name: String
    occupation: String
    annualSalary: Int
    contactNumber: String
  }
  input AddressInputObject {
    current: AddressInputDefinition
    permanent: AddressInputDefinition
  }
  input AddressInputDefinition {
    locality: String
    district: String
    city: String
    pincode: Int
    state: String
  }
  input StudentInput {
    _id: ID
    rollNumber: Float
    registrationNumber: String
    enrollmentNumber: Float
    name: NameInputObject
    father: ParentInputObject
    mother: ParentInputObject
    bloodGroup: String
    gender: Gender
    caste: Caste
    class: String
    religion: Religion
    dateOfBirth: String
    address: AddressInputObject
    aadharNumber: String
    photo: String
    email: String
    contactNumber: String
    dateOfLeaving: String
  }

  type Name {
    first: String
    last: String
  }
  type Parent {
    name: String
    occupation: String
    annualSalary: Int
    contactNumber: String
  }
  type Address {
    current: AddressDefinition
    permanent: AddressDefinition
  }
  type AddressDefinition {
    locality: String
    district: String
    city: String
    pincode: Int
    state: String
  }
  type Student {
    _id: ID
    rollNumber: Float
    registrationNumber: String
    enrollmentNumber: Float
    registeredOn: String
    name: Name
    father: Parent
    mother: Parent
    bloodGroup: String
    gender: Gender
    caste: Caste
    class: String
    religion: Religion
    dateOfBirth: String
    address: Address
    photo: String
    email: String
    present: [String]
    aadharNumber: String
    contactNumber: String
    dateOfLeaving: String
  }

  input AttendenceInput {
    _id: ID
    class: String
    holiday: Boolean
    students: [String]
  }
  type Attendence {
    _id: ID
    holiday: Boolean
    students: [String]
  }

  input ClassInput {
    _id: ID
    subjects: [String]
  }
  type Class {
    _id: ID
    totalStudents: Int
    subjects: [String]
    attendence: [Attendence]
    students: [Student]
  }

  type Query {
    classes(_id: ID): [Class]
    student(_id: ID): Student
    students(class: String): [Student]
  }
  type Mutation {
    addClass(input: ClassInput): String
    addStudent(input: StudentInput): String
    addAttendence(input: AttendenceInput): String
  }
`;
