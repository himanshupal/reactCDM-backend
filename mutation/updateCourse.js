const { UserInputError, ForbiddenError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Director`, `Head of Department`];

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (!permitted.includes(access)) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`courses`);

		if (data.name) {
			const check = await node.findOne({ name: data.name });
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a course with same name.`,
				});
		}

		if (data.identifier) {
			const check = await node.findOne({ identifier: data.identifier });
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a course with same identifier.`,
				});
		}

		if (data.headOfDepartment) {
			const check = await node.findOne({
				headOfDepartment: data.headOfDepartment,
			});
			if (check)
				throw new UserInputError(`Teacher reallocation ⚠`, {
					error: `The teacher is already assigned as Head of another Department.`,
				});

			const previous = await node.findOne({ _id: ObjectId(_id) });
			if (!previous)
				throw new UserInputError(`Not Found ⚠`, {
					error: `Couldn't find the course you are trying to update. Please try again or contact admin if issue persists.`,
				});

			const { modifiedCount } = await client
				.db(`RBMI`)
				.collection(`teachers`)
				.updateOne({ _id: ObjectId(previous.headOfDepartment) }, { $set: { designation: `Associate Professor` } });

			if (!modifiedCount)
				throw new UserInputError(`Unknown Error ⚠`, {
					error: `Error updating department. Please try again or contact admin if issue persists.`,
				});
		}

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...data,
					updatedAt: Timestamp.fromNumber(Date.now()),
					updatedBy: loggedInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error updating course. Please try again or contact admin if issue persists.`,
			});

		const [course] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						headOfDepartment: { $toObjectId: `$headOfDepartment` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
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
				{
					$lookup: {
						from: `teachers`,
						localField: `updatedBy`,
						foreignField: `_id`,
						as: `updatedBy`,
					},
				},
				{ $unwind: { path: `$updatedBy`, preserveNullAndEmptyArrays: true } },
			])
			.toArray();

		return course;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
