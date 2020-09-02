const { gql } = require(`apollo-server`);

module.exports = gql`
	input NameInput {
		first: String
		last: String
	}
	input ParentInput {
		name: String
		occupation: String
		annualSalary: String
		contactNumber: String
	}
	input AddressInput {
		current: AddressInputDefinition
		permanent: AddressInputDefinition
	}
	input AddressInputDefinition {
		locality: String
		district: String
		tehsil: String
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

	input StudentInput {
		username: String
		rollNumber: String
		registrationNumber: String
		enrollmentNumber: String
		name: NameInput
		father: ParentInput
		mother: ParentInput
		bloodGroup: String
		gender: String
		caste: String
		class: ID
		religion: String
		dateOfBirth: String
		address: AddressInput
		photo: String
		email: String
		aadharNumber: String
		contactNumber: String
		dateOfLeaving: String
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
		aadharNumber: String
		contactNumber: String
		admissionDate: String
		dateOfLeaving: String

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input TeacherInput {
		username: String
		designation: String
		registrationNumber: String
		department: ID
		name: NameInput
		bloodGroup: String
		gender: String
		caste: String
		religion: String
		dateOfBirth: String
		address: AddressInput
		aadharNumber: String
		photo: String
		email: String
		contactNumber: String
		alternativeContact: String
		dateOfJoining: String
		dateOfLeaving: String
	}
	type Teacher {
		_id: ID
		username: String
		designation: String
		registrationNumber: String
		department: Department
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
		teaches: [Subject]
		contactNumber: String
		alternativeContact: String
		dateOfJoining: String
		dateOfLeaving: String
		classTeacherOf: Class

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input AttendenceInput {
		day: String
		holiday: String
		students: [ID]
	}
	type Attendence {
		_id: ID
		day: String
		holiday: String
		totalStudents: Int
		students: [Student]

		createdAt: Float
		createdBy: Teacher
	}

	input PageInput {
		scope: String
		subject: String
		validFor: String
		description: String
	}
	type Page {
		_id: ID
		scope: String
		edited: Boolean
		subject: String
		validFor: String # Name of Scope
		description: String

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input SubjectInput {
		name: String
		subjectCode: String
		uniSubjectCode: String
		teacher: ID
	}
	type Subject {
		_id: ID
		name: String
		subjectCode: String
		uniSubjectCode: String
		teacher: Teacher

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input ClassInput {
		name: String
		newName: String
		sessionEnd: String
		sessionStart: String
		classTeacher: ID
	}
	type Class {
		_id: ID
		name: String
		sessionStart: String
		sessionEnd: String
		totalStudents: Int
		subjects: [Subject]!
		classTeacher: Teacher

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input CourseInput {
		name: String
		duration: String
		identifier: String
		headOfDepartment: ID
		semesterBased: Boolean
	}
	type Course {
		_id: ID!
		name: String
		duration: String
		identifier: String
		semesterBased: Boolean
		headOfDepartment: Teacher

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input DepartmentInput {
		name: String
		director: ID
	}
	type Department {
		_id: ID!
		name: String
		director: Teacher

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	input TimeMapInput {
		subject: ID
		teacher: ID
	}
	input TimeTableInput {
		from: String
		to: String
		days: [TimeMapInput]!
	}

	type TimeMap {
		subject: Subject
		teacher: Teacher
	}
	type TimeTable {
		_id: ID
		from: String
		to: String
		days: [TimeMap]!

		createdAt: Float
		createdBy: Teacher
		updatedAt: Float
		updatedBy: Teacher
	}

	type Query {
		departments: [Department]!

		courses(department: ID): [Course]!

		teachers(department: ID): [Teacher]!
		teacher(username: String): Teacher!

		students(class: ID): [Student]!
		student(username: String): Student!

		classes(course: ID!): [Class]!

		timeTable(class: String!): TimeTable!

		attendence(class: ID, month: Int, year: Int): [Attendence]!

		friends: [Student]!

		notes(page: Int!): [Page]!

		notices(page: Int!): [Page]!
		notice(_id: ID!): Page!
	}

	type Mutation {
		addAttendence(class: ID, data: AttendenceInput!): Attendence!
		attendenceMonth(class: ID!, data: [AttendenceInput]!): [Attendence]!

		addTimeTable(class: String!, data: [TimeTableInput]!): TimeTable!
		updateTimeTable(_id: ID!, data: [TimeTableInput]!): TimeTable!

		addSubject(class: String!, data: [SubjectInput]!): [Subject]!
		updateSubject(_id: ID!, data: SubjectInput!): Subject!
		deleteSubject(_id: ID!): Boolean!

		newSession(course: ID!, data: [ClassInput]!): [Class]!
		updateClass(_id: ID!, data: ClassInput!): Class!
		deleteClass(_id: ID!): Boolean!

		addDepartment(data: DepartmentInput!): Department!
		updateDepartment(_id: ID!, data: DepartmentInput!): Department!

		addCourse(department: ID!, data: CourseInput!): Course!
		updateCourse(_id: ID!, data: CourseInput!): Course!
		deleteCourse(_id: ID!, classes: Boolean): Boolean!

		addTeacher(data: TeacherInput!): Teacher!
		updateTeacher(_id: ID!, data: TeacherInput!): Teacher!
		deleteTeacher(_id: ID!): Boolean!

		addStudent(data: StudentInput!): Student!
		updateStudent(_id: ID!, data: StudentInput!): Student!
		deleteStudent(_id: ID!): Boolean!

		addFriends(friends: [ID]!): [Student]!
		updateFriends(friends: [ID]!): [Student]!

		addNote(data: PageInput!): Page!
		updateNote(_id: ID!, data: PageInput!): Page!
		deleteNote(_id: ID!): Boolean!

		addNotice(data: PageInput!): Page!
		updateNotice(_id: ID!, data: PageInput!): Page!
		deleteNotice(_id: ID!): Boolean!

		login(username: String!, password: String!): String!
		changePassword(oldPassword: String!, newPassword: String!): String!
	}
`;
