/**
 * Prompt Utility
 * User input prompts
 */

import inquirer from 'inquirer';

export async function prompt(question: inquirer.QuestionCollection) {
  return inquirer.prompt([question]);
}

export async function confirm(message: string, defaultValue = true): Promise<boolean> {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);
  return answer.confirmed;
}

export async function select(
  message: string,
  choices: string[],
  defaultValue?: string
): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selected',
      message,
      choices,
      default: defaultValue,
    },
  ]);
  return answer.selected;
}

export async function input(
  message: string,
  defaultValue?: string,
  validate?: (input: string) => boolean | string
): Promise<string> {
  const answer = await inquirer.prompt([
    {
      type: 'input',
      name: 'value',
      message,
      default: defaultValue,
      validate,
    },
  ]);
  return answer.value;
}