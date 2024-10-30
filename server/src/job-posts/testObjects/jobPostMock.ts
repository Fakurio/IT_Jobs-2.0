import {JobPost} from "../../entities/job-post.entity";
import {ContractType, ContractTypeEnum} from "../../entities/contract-type.entity";
import {Level, LevelEnum} from "../../entities/level.entity";
import {User} from "../../entities/user.entity";
import {Status, StatusEnum} from "../../entities/status.entity";
import {Language, LanguageEnum} from "../../entities/language.entity";

const sampleJobPost = new JobPost();

sampleJobPost.id = 1;
sampleJobPost.companyName = "Tech Corp";
sampleJobPost.title = "Software Engineer";
sampleJobPost.salary = 80000;
sampleJobPost.logo = "logo.png";
sampleJobPost.description = "A great job at a great company.";
sampleJobPost.location = "San Francisco";

const sampleContractType = new ContractType();
sampleContractType.id = 1;
sampleContractType.type = ContractTypeEnum.B2B;
sampleJobPost.contractType = sampleContractType;

const sampleLevel = new Level();
sampleLevel.id = 1;
sampleLevel.level = LevelEnum.JUNIOR;

const sampleAuthor = new User();
sampleAuthor.id = 1;
sampleAuthor.username = "johndoe";
sampleJobPost.author = sampleAuthor;

const sampleStatus = new Status();
sampleStatus.id = 1;
sampleStatus.status = StatusEnum.ACCEPTED;

const sampleLanguage = new Language();
sampleLanguage.id = 1;
sampleLanguage.language = LanguageEnum.JAVASCRIPT;
const sampleLanguage2 = new Language();
sampleLanguage2.language = LanguageEnum.C;
const sampleLanguages: Language[] = [
    sampleLanguage, sampleLanguage2
];
sampleJobPost.languages = sampleLanguages;

export {sampleJobPost};