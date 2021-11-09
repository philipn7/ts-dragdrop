interface Validatible {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = (validabibleItem: Validatible): boolean => {
  const { value, required, minLength, maxLength, min, max } = validabibleItem;
  let isValid = true;

  if (required) {
    isValid = isValid && value.toString().trim().length !== 0;
  }
  if (typeof value === 'string') {
    if (minLength != null) isValid = isValid && value.trim().length >= minLength;
    if (maxLength != null) isValid = isValid && value.trim().length <= maxLength;
  }
  if (typeof value === 'number') {
    if (min != null) isValid = isValid && value >= min;
    if (max != null) isValid = isValid && value <= max;
  }

  return isValid;
};

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    this.attach();
    this.renderContent();
  }

  private renderContent() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listID;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app') as HTMLDivElement;

    // take that reference to template and turn it into dom node
    const importedNode = document.importNode(this.templateElement.content, true);
    // insertAdjacentElement takes in element. In this case it's a form element
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput = (): [string, string, number] | void => {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = this.peopleInputElement.value;

    const titleValidatible = {
      value: title,
      required: true,
    };
    const descriptionValidatible = {
      value: description,
      required: true,
    };
    const peopleValidatible = {
      value: parseInt(people),
      required: true,
      max: 8,
    };

    if (
      validate(titleValidatible) &&
      validate(descriptionValidatible) &&
      validate(peopleValidatible)
    ) {
      return [title, description, parseInt(people)];
    } else {
      alert('Invalid input! Please try again.');
      return;
    }
  };

  submitHandler = (event: Event) => {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
    }
  };

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const prjInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
