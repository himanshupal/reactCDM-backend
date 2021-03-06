const { ForbiddenError, UserInputError } = require(`apollo-server`);
const { MongoClient, ObjectId, Timestamp } = require(`mongodb`);

const authenticate = require(`../checkAuth`);
const { dbName } = require(`../config`);

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);

		if (access === `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(dbName).collection(`classes`);

		if (data.newName)
			throw new UserInputError(`Error in data provided ⚠`, {
				error: `Use \`name\` instead of \`newName\` to update name of Class.`,
			});

		if (data.name) {
			const check = await node.findOne({ name: data.name });
			if (check)
				throw new UserInputError(`Already exists ⚠`, {
					error: `There is already a class with same name.`,
				});

			const { name } = await node.findOne({ _id: ObjectId(_id) });

			await client
				.db(dbName)
				.collection(`notices`)
				.updateMany({ scope: `Class`, validFor: name }, { $set: { validFor: data.name } });

			await client
				.db(dbName)
				.collection(`subjects`)
				.updateMany({ class: name }, { $set: { class: data.name } });

			await client
				.db(dbName)
				.collection(`timetables`)
				.updateMany({ class: name }, { $set: { class: data.name } });
		}

		if (data.classTeacher) {
			const check = await node.findOne({ classTeacher: data.classTeacher });
			if (check) {
				const teacher = await client
					.db(dbName)
					.collection(`teachers`)
					.findOne({ _id: ObjectId(check.classTeacher) });
				throw new UserInputError(`Classteacher reallocation ⚠`, {
					error: `${teacher.name.first} ${teacher.name.last} is already assigned as classteacher for ${check.name}.`,
				});
			}
		}

		const { lastErrorObject, value } = await node.findOneAndUpdate(
			{ _id: ObjectId(_id) },
			{
				$set: {
					...data,
					updated: Timestamp.fromNumber(Date.now()),
					updatedBy: loggedInUser,
				},
			},
			{ returnOriginal: false }
		);

		if (!lastErrorObject.n)
			throw new UserInputError(`Unknown Error ⚠`, {
				error: `Error creating/updating class. Please try again or contact admin if issue persists.`,
			});

		const [updatedClass] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						classTeacher: { $toObjectId: `$classTeacher` },
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
				{
					$lookup: {
						from: `teachers`,
						localField: `classTeacher`,
						foreignField: `_id`,
						as: `classTeacher`,
					},
				},
				{ $unwind: { path: `$classTeacher`, preserveNullAndEmptyArrays: true } },
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

		return updatedClass;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
