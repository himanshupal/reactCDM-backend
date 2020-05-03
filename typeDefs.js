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
		_id: ID #StudentId
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
		role: String
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
		_id: ID #StudentId
		rollNumber: Float
		registrationNumber: String
		enrollmentNumber: Float
		name: Name
		father: Parent
		mother: Parent
		bloodGroup: String
		gender: Gender
		caste: Caste
		class: Class
		religion: Religion
		dateOfBirth: String
		address: Address
		photo: String
		email: String
		role: String
		attendence: [AttendenceClass]
		aadharNumber: String
		contactNumber: String
		dateOfLeaving: String
		createdAt: Float
		lastUpdated: Float
	}

	input AttendenceInputBulk {
		class: String
		data: [AttendenceInput]
	}

	input AttendenceInput {
		_id: ID #Date
		class: String
		holiday: Boolean
		students: [String]
	}
	type AttendenceClass {
		_id: ID #Date
		holiday: Boolean
		totalStudents: Int
		students: [String]
		createdAt: Float
		lastUpdated: Float
	}
	type AttendenceDay {
		holiday: Boolean
		totalStudents: Int
		students: [Student]
		createdAt: Float
		lastUpdated: Float
	}

	input ClassInput {
		_id: ID #Batch
		sessionStart: String
		sessionEnd: String
		className: String
		department: String
		classTeacher: String
	}
	type Class {
		_id: ID #Batch
		sessionStart: String
		sessionEnd: String
		className: String
		totalStudents: Int
		department: String
		timeTable: [Subject]
		classTeacher: String
		attendence: [AttendenceClass]
		students: [Student]
		createdAt: Float
		lastUpdated: Float
	}

	input SubjectInput {
		_id: String
		class: String
		name: String
		teacher: String
		from: String
		to: String
	}
	type Subject {
		_id: String
		class: String
		name: String
		teacher: String
		from: String
		to: String
		createdAt: Float
		lastUpdated: Float
	}

	input TeacherInput {
		_id: ID #TeacherId
		designation: String
		registrationNumber: String
		name: NameInputObject
		father: ParentInputObject
		mother: ParentInputObject
		bloodGroup: String
		gender: Gender
		caste: Caste
		religion: Religion
		dateOfBirth: String
		address: AddressInputObject
		aadharNumber: String
		photo: String
		email: String
		major: String
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
	}
	type Teacher {
		_id: ID #TeacherId
		designation: String
		registrationNumber: String
		name: Name
		father: Parent
		mother: Parent
		bloodGroup: String
		gender: Gender
		caste: Caste
		religion: Religion
		dateOfBirth: String
		address: Address
		aadharNumber: String
		photo: String
		email: String
		major: String
		teaches: [Subject]
		contactNumber: String
		dateOfJoining: String
		dateOfLeaving: String
		classTeacherOf: String
		createdAt: Float
		lastUpdated: Float
	}

	input GistInput {
		creator: String
		subject: String
		description: String
		scope: String
	}

	type Gist {
		_id: ID
		creator: String
		subject: String
		description: String
		scope: String
		createdAt: Float
		lastUpdated: Float
	}

	input LoginInput {
		username: String
		password: String
		otk: String
	}

	type Login {
		username: String
		token: String
	}

	type Query {
		getGist(_id: ID): [Gist]
		getStudent(_id: ID): Student
		getTeacher(_id: ID): [Teacher]
		getAttendence(_id: String): AttendenceDay
		getClass(_id: ID, department: String): [Class]
	}
	type Mutation {
		login(input: LoginInput): Login

		createGist(input: GistInput): String
		addClass(input: ClassInput): String
		addStudent(input: StudentInput): String
		addSubject(input: SubjectInput): String
		addTeacher(input: TeacherInput): String
		addAttendence(input: AttendenceInput): String

		updateClass(input: ClassInput): String
		updateStudent(input: StudentInput): String
		updateTeacher(input: TeacherInput): String
		updateSubject(input: SubjectInput): String
		updateAttendence(input: AttendenceInput): String
		addAttendenceBulk(input: AttendenceInputBulk): String
	}
`;
