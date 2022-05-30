import { Component } from '@angular/core';
import { Storage } from '@capacitor/storage';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  isModalOpen:boolean = false;
  tasks: Task[] = [
    new Task('Sleep To Do', 1, 'sleep after work..', TaskStatus.ToDo)
  ];
  newTask: Task;

  title:string;
  time:number;
  description:string;

  showList: Boolean = false;
  IsSheetModalOpen: boolean = false;
  statusButtonColor: string = 'danger';

  totalDonetime: number = 0;
  totalInProgresstime: number = 0;
  totalToDotime: number = 0;

  constructor() {}

  async ngOnInit(){
    if(this.tasks != []){
      this.showList = true;
      console.log(this.tasks)
    }
    this.tasks.forEach(element => {
      this.totalToDotime += element.Time;
    });
  }

  async Add(){
    if(this.title != '' || this.time != 0){
      this.newTask = new Task (
      this.title,
      this.time,
      this.description,
      );

      this.SaveTask(this.newTask);
    
      this.tasks.push(this.newTask);
      this.showList = true;
      this.HideModal();
      this.totalToDotime += this.newTask.Time;

      console.log(JSON.parse((await this.GetTasks()).value));

      return this.newTask.Id;
    }
  }

  Edit(newTask: Task){
    var task = this.tasks.find(_=>_.Id == newTask.Id);
    var index = this.tasks.indexOf(task);
    this.IsSheetModalOpen = true;
    this.tasks[index] = newTask;
  }

  Delete(guid:Guid){

    let task = this.tasks.find(_=>_.Id == guid);

    if(task.Status == TaskStatus.ToDo){
      this.totalToDotime -= task.Time;
    }
    if(task.Status == TaskStatus.InProgress){
      this.totalInProgresstime -= task.Time;
    }
    if(task.Status == TaskStatus.Done){
      this.totalDonetime -= task.Time;
    }
    
    this.tasks.forEach((element, index) => {
      if(element.Id == task.Id){
        delete this.tasks[index];
        this.tasks = this.tasks.filter(function (T){
          return T != null;
        });
        if(this.tasks.length == 0){
          this.showList = false;
        }
      }
    });
  }

  async SaveTask(task: Task){
    var jsonTask = JSON.stringify(task);
    var uri = "data:application/json;charset=UTF-8," + encodeURIComponent(jsonTask);

    var a = document.createElement('a');
    a.href = uri;
    a.innerHTML = "Right-click and choose 'save as...'";
    document.body.appendChild(a);
  }

  async GetTasks(){
    return await Storage.get({
      key:'task'
    });
  }

  IsNull(tasks: Task[]){
    if(tasks == null)
      return true;
  }

  GetTaskStatus(guid: Guid){
    return TaskStatus[this.tasks.find(_=>_.Id == guid).Status]
  }

  ChangeStatus(guid: Guid){
    let status = this.tasks.find(_=>_.Id == guid).Status;

    if(status == 1){
      this.tasks.forEach((element) => {
        if(element.Id == guid) 
          element.Status = 2});
      document.getElementById(guid.toString()).setAttributeNS('button', 'color', 'warning');
      this.totalToDotime -= this.tasks.find(_=>_.Id == guid).Time;
      this.totalInProgresstime += this.tasks.find(_=>_.Id == guid).Time;
    }

    if(status == 2){
      this.tasks.forEach((element) => {
        if(element.Id == guid) 
          element.Status = 3});
      document.getElementById(guid.toString()).setAttributeNS('button', 'color', 'success');
      this.totalInProgresstime -= this.tasks.find(_=>_.Id == guid).Time;
      this.totalDonetime += this.tasks.find(_=>_.Id == guid).Time;
    }

    if(status == 3){
      this.tasks.forEach((element) => {
        if(element.Id == guid) 
          element.Status = 1});
      document.getElementById(guid.toString()).setAttributeNS('button', 'color', 'primary');
      this.totalDonetime -= this.tasks.find(_=>_.Id == guid).Time;
      this.totalToDotime += this.tasks.find(_=>_.Id == guid).Time;
    }
  }

  ShowModal(){
    this.isModalOpen = true;
  }

  HideModal(){
    this.isModalOpen = false;
  }

}

class Guid {
  static newGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export class Task{

  constructor(title, time, description, status?: TaskStatus){
    this.Id = Guid.newGuid();
    this.Title = title;
    this.Time = time;
    this.Status = status;
    if(status == null){
      this.Status = TaskStatus.ToDo;
    }
    this.Description = description;
  }

  Id: Guid;
  Title: string;
  Time: number;
  tag: string;
  Status: TaskStatus;
  Description: string;
}

enum TaskStatus{
  ToDo = 1,
  InProgress = 2,
  Done = 3
}
