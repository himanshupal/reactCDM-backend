const { UserInputError, ForbiddenError } = require(`apollo-server`),
	{ MongoClient } = require(`mongodb`);

const authenticate = require(`../../checkAuth`),
	accessAllowed = [`Director`, `Head of Department`, `Associate Professor`];

module.exports = async (_, { class_id, subjects }, { authorization }) => {
	const client = new MongoClient(process.env.mongo_link, {
		keepAlive: false,
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	try {
		await client.connect();
		const user = await authenticate(authorization);
		const node = client.db(`RBMI`).collection(`subjects`);
		if (!accessAllowed.includes(user.access)) throw new ForbiddenError(`Access Denied ⚠`);
		const res = await Promise.all(
			subjects.map(async (subject) => {
				if (subject.subjectCode !== undefined)
					try {
						const check = await node.findOne({ subjectCode: subject.subjectCode });
						if (check)
							throw new UserInputError(`Already exists ⚠`, {
								error: `Subject ${check.name} with code ${subject.subjectCode} already exists.`,
							});
						return await node.insertOne({
							name: subject.name,
							subjectCode: subject.subjectCode,
							uniSubjectCode: subject.uniSubjectCode,
							teacher: subject.teacher,
							class: class_id,
							createdAt: Date.now(),
							createdBy: user.username,
						});
					} catch (e) {
						return e;
					}
			})
		);
		return res.length > 0
			? `Subject(s) saved successfully ✔`
			: `There was some error saving subject. Please try again or contact admin if issue persists.`;
	} catch (error) {
		return error;
	} finally {
		await client.close();
	}
};
