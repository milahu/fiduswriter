export class indexedDB {
  constructor(app){
    this.app = app
    this.init()
  }
  
  init(){
    this.app['db_config'] = {
      "db_name":this.app.config.user.username,
    }

    // Open/Create db if it doesn't exist
    let request = window.indexedDB.open(this.app.db_config.db_name);
    request.onerror = function(event) {
      //
    };

    request.onsuccess = () => {
        let database = event.target.result;
        this.app.db_config['version']=database.version
        database.close()
        if(this.app.db_config.version<2)
          this.createDBSchema()
    }
  }

  createDBSchema(){
    this.app.db_config.version+=1
    let new_request = window.indexedDB.open(this.app.db_config.db_name,this.app.db_config.version)
    new_request.onupgradeneeded = function(event) {
        let db = event.target.result;
        //Creating a export_templates object store
        db.createObjectStore("documents", { keyPath: "id" })
        db.createObjectStore("document_templates", { keyPath: "pk" })
        db.createObjectStore("team_members", { keyPath: "id" })
        db.createObjectStore("export_templates", { autoIncrement: true })
        db.createObjectStore("document_styles", { keyPath : "title" })
        db.createObjectStore("contacts_list", { keyPath : "id" })
        db.createObjectStore("image_db", { keyPath : "name" })
        db.close()
    }
  }

  createObjectStore(name,options){
    this.app.db_config.version+=1
    let new_request = window.indexedDB.open(this.app.db_config.db_name,this.app.db_config.version)
    new_request.onupgradeneeded = function(event) {
        let db = event.target.result;
        db.createObjectStore(name,options);
    }

  }

  updateData(objectStoreName,data){
    let request = window.indexedDB.open(this.app.db_config.db_name);
    request.onerror = function(event) {
      //
    };

    request.onsuccess = () => {
      let db = event.target.result;
      let objectStore = db.transaction(objectStoreName,'readwrite').objectStore(objectStoreName)
      for(let d in data){
        objectStore.put(d)
      }
    }
  }

  insertData(objectStoreName,data){
    let request = window.indexedDB.open(this.app.db_config.db_name);
    request.onerror = function(event) {
      //
    };
    request.onsuccess = () => {
      let db = event.target.result;
      let objectStore = db.transaction(objectStoreName,'readwrite').objectStore(objectStoreName)
      if(data !== undefined){
        data.forEach(function(document) {
          objectStore.add(document);
        });
      }
    }
  }

  clearData(objectStoreName){
    let request = window.indexedDB.open(this.app.db_config.db_name);
    request.onerror = function(event) {
      //
    };
    request.onsuccess = () => {
      let db = event.target.result;
      let objectStore = db.transaction(objectStoreName,'readwrite').objectStore(objectStoreName)
      objectStore.clear();
    }
  }

  readAllData(objectStoreName){
    let new_promise = new Promise((resolve,reject)=>{
      let request = window.indexedDB.open(this.app.db_config.db_name);
      request.onerror = function(event) {
        //
      };
      request.onsuccess = () => {
          let db = event.target.result;
          let objectStore = db.transaction(objectStoreName,'readwrite').objectStore(objectStoreName)
          let read_all_request = objectStore.getAll();
          read_all_request.onerror = function(event) {
            // Handle errors!
          };
          read_all_request.onsuccess = function(event) {
            // Do something with the request.result!
            resolve(read_all_request.result);
          };
      }
    })
    return new_promise
  }

  saveImage(imageData,filename){
    let request = window.indexedDB.open(this.app.db_config.db_name);
    request.onerror = function(event) {
      //
    };
    request.onsuccess = () => {
      let db = event.target.result;
      let reader = new FileReader()
      reader.readAsDataURL(imageData)
      reader.onload = function(e) {
        //alert(e.target.result);
        let bits = e.target.result;
        let ob = {
          name:filename.split('/').pop(),
          data:bits
        };

        let trans = db.transaction(['image_db'], 'readwrite');
        let addReq = trans.objectStore('image_db').put(ob);

        addReq.onerror = function(e) {
          //
        }

        trans.oncomplete = function(e) {
          //
        }
      } 
    }
  }

  readImage(name){
    let new_promise = new Promise((resolve,reject)=>{
      let request = window.indexedDB.open(this.app.db_config.db_name);
      request.onerror = function(event) {
        //
      };
      request.onsuccess = () => {
        let db = event.target.result;
        let trans = db.transaction(['image_db'], 'readonly');
        //hard coded id
        let req = trans.objectStore('image_db').get(name);
        req.onsuccess = function(e) {
          let record = e.target.result;
          resolve(record.data)
        }
      }
    })
    return new_promise
  }
}