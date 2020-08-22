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
		createdBy: ID
		updatedAt: Float
		updatedBy: ID
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
		teaches: [Subject]
		department: String
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
		classTeacherOf: Class
		alternativeContact: String
		createdAt: Float
		createdBy: ID
		updatedAt: Float
		updatedBy: ID
	}

	input NoteInput {
		subject: String
		description: String
		scope: String
		scopeId: String
	}
	type Note {
		_id: ID
		subject: String
		description: String
		scope: String
		scopeId: String
		createdAt: Float
		createdBy: ID
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
		class: String
		createdAt: Float
		createdBy: ID
		updatedAt: Float
		updatedBy: ID
	}
	input SessionInput {
		name: String
		newName: String
		sessionEnd: String
		sessionStart: String
		classTeacher: ID
	}
	type Class {
		_id: ID
		name: String
		course: String
		sessionStart: String
		sessionEnd: String
		totalStudents: Int
		students: [Student]
		classTeacher: ID
		createdAt: Float
		createdBy: ID
		updatedAt: Float
		updatedBy: ID
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
		createdBy: ID
		createdAt: Float
		updatedAt: Float
		updatedBy: ID
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
		createdBy: ID
		updatedAt: Float
		updatedBy: ID
	}
	type RootDpt {
		departments: [Department]!
		teachers: [Teacher]!
	}

	input DayTimeMapInput {
		subjectId: ID
		teacherId: ID
	}
	input TimeTableInput {
		from: String
		to: String
		detail: [DayTimeMapInput]!
	}

	type DayTimeMap {
		subjectId: ID
		teacherID: ID
	}
	type SubjectDayTimeMap {
		from: String
		to: String
		detail: [DayTimeMap]!
	}
	type TimeTable {
		_id: ID
		time: [SubjectDayTimeMap]!
	}

	type Query {
		departments: RootDpt!
		class(cid: ID): Class!
		notes(nid: ID): [Note]!
		subjects(className: String): [Subject]!
		timeTable(className: String!): TimeTable!
		teachers(department: ID, teacher: ID): [Teacher]!
		classes(course: ID!): [Class]
		students(sid: ID, cid: ID): [Student]!
		attendence(cid: ID, of: String!): [Attendence]!
		attendenceMonth(cid: ID, month: Int, year: Int): [Attendence]!
	}
	type Mutation {
		addAttendence(data: AttendenceInput!): String!
		addAttendenceMany(cid: ID!, data: [AttendenceInput]!): String!
		updateAttendence(aid: ID!, data: [AttendenceInput]!): String!

		createTimeTable(className: String!, data: [TimeTableInput]!): String!
		updateTimeTable(_id: ID!, data: [TimeTableInput]!): String!

		addSubject(class_id: ID!, subjects: [SubjectInput]!): String!
		updateSubject(sid: ID!, data: SubjectInput!): String!

		newSession(course: ID!, data: [SessionInput]!): String!
		updateDepartment(did: ID!, data: DptInput!): String!

		addTeacher(data: TeacherInput!): String!
		updateTeacher(tid: ID!, data: TeacherInput!): String!

		addStudent(data: StudentInput!): String!
		updateStudent(sid: ID!, data: StudentInput!): String!

		addCourse(data: CourseInput!): String!
		updateCourse(cid: ID!, data: CourseInput!): String!

		createNotice(data: NoteInput!): String!
		updateClass(cid: ID!, data: SessionInput!): String!

		createNote(data: NoteInput!): String!
		updateNote(gid: ID!, data: NoteInput!): String!

		login(username: String!, password: String!): String!

		changePassword(oldPassword: String!, newPassword: String!): String!
	}
`;
