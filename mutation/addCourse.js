const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

module.exports = async (_, { data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access !== `Director`) throw new ForbiddenError(`Access Denied ⚠`);

		if (
			!data.name ||
			!data.duration ||
			!data.department ||
			!data.identifier ||
			!data.semesterBased ||
			!data.headOfDepartment
		)
			throw new UserInputError(`Argument Missing ⚠`, {
				error: `All fields are required.`,
			});

		const node = client.db(`RBMI`).collection(`courses`);

		const department = await client
			.db(`RBMI`)
			.collection(`departments`)
			.findOne({ _id: ObjectId(data.department) });
		if (!department)
			throw new UserInputError(`Department not found ⚠`, {
				error: `Couldn't find any department with provided details.`,
			});

		const check = await node.findOne({
			$or: [
				{ name: data.name },
				{ identifier: data.identifier },
				{ headOfDepartment: data.headOfDepartment },
			],
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
			if (check.headOfDepartment === data.headOfDepartment)
				throw new UserInputError(`Teacher reallocation ⚠`, {
					error: `The teacher is already assigned as Head of another Department.`,
				});
		}

		const {
			ops: [{ _id }],
		} = await node.insertOne({
			...data,
			createdAt: Timestamp.fromNumber(Date.now()),
			createdBy: loggedInUser,
		});

		const [course] = await node
			.aggregate([
				{ $match: { _id } },
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
				{ $unwind: `$headOfDepartment` },
				{
					$lookup: {
						from: `teachers`,
						localField: `createdBy`,
						foreignField: `_id`,
						as: `createdBy`,
					},
				},
				{ $unwind: `$createdBy` },
			])
			.toArray();

		return course;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
