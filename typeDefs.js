const { gql } = require(`apollo-server`);

module.exports = gql`
	input NameInputObject {
		first: String
		last: String
	}
	input ParentInputObject {
		name: String
		occupation: String
		annualSalary: String
		contactNumber: String
	}
	input AddressInputObject {
		current: AddressInputDefinition
		permanent: AddressInputDefinition
	}
	input AddressInputDefinition {
		locality: String
		district: String
		tehsil: String
	}
	input StudentInput {
		username: String
		rollNumber: String
		registrationNumber: String
		enrollmentNumber: String
		name: NameInputObject
		father: ParentInputObject
		mother: ParentInputObject
		bloodGroup: String
		gender: String
		caste: String
		class: String
		religion: String
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
		tehsil: String
	}
	type Student {
		_id: ID
		username: String
		rollNumber: String
		registrationNumber: String
		enrollmentNumber: String
		name: Name
		father: Parent
		mother: Parent
		bloodGroup: String
		gender: String
		caste: String
		class: Class
		religion: String
		dateOfBirth: String
		address: Address
		photo: String
		email: String
		attendence: [Attendence]
		aadharNumber: String
		contactNumber: String
		dateOfLeaving: String
		createdAt: Float
		updatedAt: Float
	}
	input AttendenceInput {
		day: String
		class: String
		holiday: String
		students: [String]
	}
	type Attendence {
		_id: ID
		day: String
		holiday: String
		totalStudents: Int
		students: [String]
		createdAt: Float
		createdBy: String
		updatedAt: Float
		updatedBy: Float
	}

	input TeacherInput {
		name: NameInputObject
		bloodGroup: String
		username: String
		caste: String
		photo: String
		email: String
		gender: String
		religion: String
		department: String
		designation: String
		dateOfBirth: String
		aadharNumber: String
		contactNumber: String
		registrationNumber: String
		address: AddressInputObject
		alternativeContact: String
		dateOfJoining: String
		dateOfLeaving: String
	}
	type Teacher {
		_id: ID
		username: String
		designation: String
		registrationNumber: String
		name: Name
		bloodGroup: String
		gender: String
		caste: String
		religion: String
		dateOfBirth: String
		address: Address
		aadharNumber: String
		photo: String
		email: String
		teaches: [Subject]!
		department: String
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
		classTeacherOf: Class
		alternativeContact: String
		createdAt: Float
		createdBy: String
		updatedAt: Float
		updatedBy: String
	}

	input GistInput {
		subject: String
		description: String
		scope: String
	}
	type Gist {
		_id: ID
		subject: String
		description: String
		scope: String
		createdAt: Float
		createdBy: String
	}

	input SubjectInput {
		name: String
		subjectCode: String
		uniSubjectCode: String
		teacher: String
		class: String
		from: String
		to: String
	}
	type Subject {
		_id: ID
		name: String
		subjectCode: String
		uniSubjectCode: String
		teacher: String
		class: String
		from: String
		to: String
		createdAt: Float
		createdBy: String
		updatedAt: Float
		updatedBy: String
	}
	input SessionInput {
		name: String
		newName: String
		sessionEnd: String
		sessionStart: String
		classTeacher: String
	}
	type Class {
		_id: ID
		name: String
		course: String
		sessionStart: String
		sessionEnd: String
		totalStudents: Int
		students: [Student]
		timeTable: [Subject]
		classTeacher: String
		createdAt: Float
		createdBy: String
		updatedAt: Float
		updatedBy: String
	}
	input CourseInput {
		name: String
		identifier: String
		duration: String
		semesterBased: Boolean
		director: String
		department: String
		headOfDepartment: String
	}
	type Course {
		_id: ID
		name: String
		duration: String
		identifier: String
		semesterBased: Boolean
		department: String
		director: String
		headOfDepartment: String
		createdBy: String
		createdAt: Float
		updatedAt: Float
		updatedBy: String
	}
	input DptInput {
		name: String
		director: String
		headOfDepartment: String
	}
	type Department {
		_id: ID
		name: String
		courses: [Course]
		director: String
		teachers: [Teacher]!
		headOfDepartment: String
		createdAt: Float
		createdBy: String
		updatedAt: Float
		updatedBy: String
	}
	type RootDpt {
		departments: [Department]!
		teachers: [Teacher]!
	}

	type Query {
		departments: RootDpt!
		class(cid: ID): Class!
		gists(gid: ID): [Gist]!
		teachers(tid: ID): [Teacher]!
		classes(course: ID!): [Class]
		students(sid: ID, cid: ID): [Student]!
		attendence(cid: ID, of: String!): [Attendence]!
		attendenceMonth(cid: ID, month: Int, year: Int): [Attendence]!
	}
	type Mutation {
		addAttendenceMany(cid: ID!, data: [AttendenceInput]!): String!
		updateAttendence(aid: ID!, data: [AttendenceInput]!): String!
		newSession(course: ID!, data: [SessionInput]!): String!
		updateSubject(sid: ID!, data: SubjectInput!): String!
		updateTeacher(tid: ID!, data: TeacherInput!): String!
		updateStudent(sid: ID!, data: StudentInput!): String!
		login(username: String!, password: String!): String!
		updateDepartment(did: ID!, data: DptInput!): String!
		updateClass(cid: ID!, data: SessionInput!): String!
		updateCourse(cid: ID!, data: CourseInput!): String!
		updateGist(gid: ID!, data: GistInput!): String!
		addAttendence(data: AttendenceInput!): String!
		addSubject(data: SubjectInput!): String!
		addStudent(data: StudentInput!): String!
		addTeacher(data: TeacherInput!): String!
		addCourse(data: CourseInput!): String!
		createGist(data: GistInput!): String!
	}
`;
