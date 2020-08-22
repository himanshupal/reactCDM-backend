const { hash, verify, argon2id } = require(`argon2`),
	{ UserInputError } = require("apollo-server");

const hashConfig = {
	memoryCost: 128,
	hashLength: 64,
	saltLength: 32,
	parallelism: 4,
	type: argon2id,
	timeCost: 8,
};

exports.generatePassword = async (password) => {
	try {
		return await hash(password, hashConfig);
	} catch (error) {
		throw new UserInputError(`Couldn't encrypt password ⚠`, {
			error: `There was some unusual error encrypting Password. Please try again or contact admin if issue persists.`,
		});
	}
};

exports.verifyPassword = async (password, encodedPassword) => {
	try {
		return await verify(encodedPassword, password);
	} catch (error) {
		throw new UserInputError(`Couldn't decrypt password ⚠`, {
			error: `There was some unusual error decrypting Password. Please try again or contact admin if issue persists.`,
		});
	}
};
