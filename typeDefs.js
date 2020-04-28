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
		attendence: [AttendenceClass]
		aadharNumber: String
		contactNumber: String
		dateOfLeaving: String
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
	}
	type AttendenceDay {
		holiday: Boolean
		totalStudents: Int
		students: [Student]
	}

	input ClassInput {
		_id: ID #ClassName
		classTeacher: String
	}
	type Class {
		_id: ID #ClassName
		totalStudents: Int
		timeTable: [Subject]
		classTeacher: String
		attendence: [AttendenceClass]
		students: [Student]
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
	}

	type Query {
		getClass(_id: ID): [Class]
		getStudent(_id: ID): Student
		getTeacher(_id: ID): [Teacher]
		getAttendence(_id: ID, class: String): AttendenceDay
	}
	type Mutation {
		addClass(input: ClassInput): String
		addStudent(input: StudentInput): String
		addSubject(input: SubjectInput): String
		addTeacher(input: TeacherInput): String
		addAttendence(input: AttendenceInput): String
	}
`;
