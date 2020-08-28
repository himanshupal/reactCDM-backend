const { UserInputError } = require(`apollo-server`);
const { MongoClient, Timestamp, ObjectId } = require(`mongodb`);

const authenticate = require(`../checkAuth`);

const permitted = [`Assistant Professor`, `Associate Professor`, `Head of Department`, `Director`];

module.exports = async (_, { _id, data }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});

	try {
		await client.connect();

		const { _id: loggedInUser, access } = await authenticate(authorization);
		if (access !== `Student`) throw new ForbiddenError(`Access Denied ⚠`);

		const node = client.db(`RBMI`).collection(`notices`);
		const teacherNode = client.db(`RBMI`).collection(`teachers`);

		if (data.scope) {
			if (![`Class`, `Course`, `Department`].includes(data.scope))
				throw new UserInputError(`Invalid Argument ⚠`, {
					error: `Notices can be provided only for class, course or for a department.`,
				});

			if (!data.validFor)
				throw new UserInputError(`Argument Missing ⚠`, {
					error: `You must provide info about ${data.scope.toLowerCase()} to add notice for.`,
				});

			const scopeCheck = await client
				.db(`RBMI`)
				.collection(data.scope === `Class` ? `classes` : data.scope === `Course` ? `courses` : `departments`)
				.findOne({ name: data.validFor });
			if (!scopeCheck)
				throw new UserInputError(`${data.scope} Not Found ⚠`, {
					error: `Couldn't find any ${data.scope.toLowerCase()} with provided details.`,
				});
		}

		const check = await node.findOne({ _id: ObjectId(_id) });
		if (!check)
			throw new UserInputError(`Not Found ⚠`, {
				error: `Couldn't find the notice you are trying to update. Please try again or contact admin if issue persists.`,
			});

		const creator = await teacherNode.findOne({ _id: ObjectId(check.createdBy) });
		const editor = await teacherNode.findOne({ _id: ObjectId(loggedInUser) });

		if (permitted.indexOf(editor.designation) < permitted.indexOf(creator.designation))
			throw new UserInputError(`Access Denied ⚠`, {
				error: `You can only edit notices created by you or someone with lower authority than yours.`,
			});

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
				error: `Error updating note. Please try again or contact admin if issue persists.`,
			});

		const [saved] = await node
			.aggregate([
				{ $match: { _id: value._id } },
				{
					$addFields: {
						createdBy: { $toObjectId: `$createdBy` },
						updatedBy: { $toObjectId: `$updatedBy` },
					},
				},
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

		return saved;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
