export default {
  overlay: {
    feedback: {
      intro: 'If you would like to contact us for any reason, please feel free to write your message in the following form. <br> Feedback and suggestions are also highly appreciated.',
      title: 'Contact us',
    },
    create_container: {
      title: 'Create container'
    },
    create_dir: {
      title: 'Create folder'
    },
    confirm_simple: {
      intro: {
        one: 'Are you sure you want to %@2 the %@3 <strong class="u-wrap">%@4</strong> ?',
        other: 'Are you sure you want to %@2 the following:'
      }
    },
    versions: {
      title: 'Versions for <strong class="u-wrap">%@</strong>'
    },
    paste: {
      
    },
    copy: {
      title: 'Copy your files',
    },
    move: {
      title: 'Move your files to',
    },
    restore: {
      title: 'Restore',
    },
    error: {
      title: 'Error report',
      intro: 'Oups... Something went wrong.',
    },
    remove_last_group_member: {
      title: 'Remove last group member',
      info: 'If you delete the last member of the group, the group will be deleted, too.',
      intro: 'Are you sure you want to delete the group %@?'

    }
  },

  button: {
    cancel: 'Abort mission!',
    send_feedback: 'send',
    create_dir: 'create',
    create_group: 'create',
    create_container: 'create',
    'delete': 'delete',
    empty: 'empty',
    remove_private_sharing: 'remove everybody',
    remove_user_from_share: 'remove',
    share_with_users: 'add users',
    share_with_all: 'privately share with everybody',
    restore: 'restore',
    remove_user_from_group: 'remove',
    delete_group: 'Delete Group',
    add_users_to_group: 'add users',
    error_details: 'Details'
  },
  
  help_text: {
    search_users: 'You can also search an e-mail by pressing enter, space or comma.',
    search_users_info: 'You can enter multiple e-mails by seperating them with comma, space, tab or enter. Do not forget to validate them!',
    create_group_info: 'The name of the group cannot have uppercase letters and more than 256 (encoded) characters' 
  },

  shortcuts_info: {
    create_new: 'Create new container or folder',
    show_groups: 'Edit groups',
    show_usage: 'Usage information'
  },

  action_verb: {
    'delete': 'delete',
    empty: 'empty',
    share: 'share',
    copy: 'copy',
    move: 'move',
    restore: 'restore',
  },

  open_dialog: {
    create_container: 'New container',
  },

  global: {
    choose_theme: 'Choose theme: ',
    prompt_feedback: 'Contact us',
    prompt_quotas: 'File Storage Usage',
  },

  icon_label: {
    move_to_trash: 'trash',
    restore_from_trash: 'restore',
    'delete': 'delete',
    copy: 'copy',
    move: 'move',
    create_dir: 'New folder',
    reload_model: 'refresh',
    groups: 'groups',
    view: 'view',
  },

  cannot_undo_action: 'The action cannot be undone',
  disable_public_sharing_for_folders: 'Public sharing is currently disabled for folders',
  private_sharing_explain: 'Only people explicitly granted permission can access. Sign-in required.',
  public_sharing_explain: 'Anyone who has the public link can access. No sign-in required.',
  choose_folder_to_move: 'Choose a folder to %@ to:',
  selected_path: 'Selected path:',

  error_report: {
    title: 'Error report\n-------------------',
    delimiter: '-'.repeat(72) + '\n',
    descr_label: 'Actions that triggered the error:' + '\n',
    errors_label: 'Errors details:' + '\n',
    system_data_label: 'Additional data:' + '\n',
  }

};
