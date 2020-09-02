const { ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { department }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { access, department: userDepartment } = await authenticate(authorization);
		if (access === `Student` || (department && access !== `Director`)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`teachers`);
		if (access === `Director` && !department) return await node.find().sort({ "name.first": 1 }).toArray();

		if (department) {
			const check = await client
				.db(dbName)
				.collection(`departments`)
				.findOne({ _id: ObjectId(department) });
			if (!check)
				throw new UserInputError(`Not Found ⚠`, {
					error: `Couldn't find the department you're trying to find teachers of.`,
				});
		}

		return await node
			.aggregate([
				{ $match: { department: department || userDepartment } },
				{
					$addFields: {
						_id: { $toString: `$_id` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `classes`,
						localField: `_id`,
						foreignField: `classTeacher`,
						as: `classTeacherOf`,
					},
				},
				{ $unwind: { path: `$classTeacherOf`, preserveNullAndEmptyArrays: true } },
				{
					$lookup: {
						from: `subjects`,
						localField: `_id`,
						foreignField: `teacher`,
						as: `teaches`,
					},
				},
			])
			.sort({ "name.first": 1 })
			.toArray();
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
