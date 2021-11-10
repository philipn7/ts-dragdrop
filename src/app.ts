class ProjectState {
  private projects: any[] = [];
  private static instance: ProjectState;
  private listeners: Function[] = [];

  private constructor() {}

  static getInstance(): ProjectState {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, desc: string, numOfPeople: number) {
    const proj = {
      title: title,
      description: desc,
      people: numOfPeople,
    };
    this.projects.push(proj);
    this.handleListeners();
  }

  handleListeners() {
    this.listeners.map((func) => {
      func(this.projects.slice());
    });
  }

  addListener(func: Function) {
    this.listeners.push(func);
  }
}

const projectState = ProjectState.getInstance();

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
  assignedProjects: any[];

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;
    this.assignedProjects = [];

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = [...this.assignedProjects, ...projects];
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)!;
    this.assignedProjects.map((proj) => {
      const listItem = document.createElement('li');
      listItem.textContent = proj.title;
      listEl.appendChild(listItem);
    });
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

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  submitHandler = (event: Event) => {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if (userInput) {
      const [title, description, people] = userInput;
      console.log(title, description, people);
      projectState.addProject(title, description, people);
      this.clearInputs();
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
