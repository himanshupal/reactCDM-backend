const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { department, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		if (!department)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `A Department must be provided to add Course to.`,
			});

		if (!data.name || !data.identifier)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `Name & Identifier must be provided.`,
			});

		const node = client.db(dbName).collection(`courses`);

		const departmentCheck = await client
			.db(dbName)
			.collection(`departments`)
			.findOne({ _id: ObjectId(department) });
		if (!departmentCheck)
			throw new UserInputError(`Department not found ⚠`, {
				error: `Couldn't find any department with provided details.`,
			});

		const check = await node.findOne({
			$or: [{ name: data.name }, { identifier: data.identifier }],
		});

		if (check) {
			if (check.name === data.name)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a course with provided name.`,
				});
			if (check.identifier === data.identifier)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a course with provided identifier.`,
				});
		}

		if (data.headOfDepartment) {
			const hodCheck = await node.findOne({ headOfDepartment: data.headOfDepartment });
			if (hodCheck)
				throw new UserInputError(`Teacher reallocation ⚠`, {
					error: `The teacher is already assigned as Head of another Department.`,
				});

			const { access: hodAccess } = await client
				.db(dbName)
				.collection(`teachers`)
				.findOne({ _id: ObjectId(data.headOfDepartment) });
			if (hodAccess === `Director`)
				throw new UserInputError(`Teacher has higher Authority ⚠`, {
					error: `The teacher you trying to assign as Head of Department is already a Director.`,
				});

			await client
				.db(dbName)
				.collection(`teachers`)
				.updateOne({ _id: ObjectId(data.headOfDepartment) }, { $set: { designation: `Head of Department` } });
		}

		const { insertedId } = await node.insertOne({
			...data,
			department,
			semesterBased: data.semesterBased || false,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [course] = await node
			.aggregate([
				{ $match: { _id: insertedId } },
				{
					$addFields: {
						headOfDepartment: { $toObjectId: `$headOfDepartment` },
						createdBy: { $toObjectId: `$createdBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `headOfDepartment`,
						foreignField: `_id`,
						as: `headOfDepartment`,
					},
				},
				{ $unwind: { path: `$headOfDepartment`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: { path: `$createdBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return course;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
